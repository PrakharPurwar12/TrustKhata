"""
Management command: recalculate_balances
─────────────────────────────────────────────────────────────────────────────
Usage:
    python manage.py recalculate_balances           # All customers
    python manage.py recalculate_balances --dry-run  # Print without saving
    python manage.py recalculate_balances --shop 42  # Scope to one shop

This command is the canonical tool for:
  • Initial backfill after deploying the denormalization migration on production.
  • Spot-check / correctness audit: compare computed vs stored values.
  • Manual repair after direct DB edits (data imports, admin bulk actions).

It intentionally does NOT use the signal-based recalculation path to avoid
triggering signals for every customer. Instead it performs the same aggregate
query pattern in bulk and uses bulk_update.
"""

import logging
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction as db_transaction

logger = logging.getLogger(__name__)

ZERO = Decimal("0.00")


class Command(BaseCommand):
    help = "Recalculate and persist denormalized balance fields on all Customer rows."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Compute and print discrepancies without writing to the DB.",
        )
        parser.add_argument(
            "--shop",
            type=int,
            metavar="SHOP_ID",
            help="Limit recalculation to a single shop.",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=500,
            metavar="N",
            help="Number of customers to update per bulk_update call (default: 500).",
        )

    def handle(self, *args, **options):
        from customers.models import Customer
        from transactions.models import Transaction

        dry_run: bool = options["dry_run"]
        shop_id: int | None = options["shop"]
        batch_size: int = options["batch_size"]

        customer_qs = Customer.objects.all()
        if shop_id:
            customer_qs = customer_qs.filter(shop_id=shop_id)

        total_customers = customer_qs.count()
        if total_customers == 0:
            self.stdout.write(self.style.WARNING("No customers found. Nothing to do."))
            return

        self.stdout.write(
            f"Processing {total_customers} customer(s)"
            + (f" for shop_id={shop_id}" if shop_id else "")
            + (" [DRY RUN]" if dry_run else "")
            + " ..."
        )

        # ── Step 1: aggregate all transactions for the scoped customers ───────
        tx_qs = Transaction.objects.filter(
            customer__in=customer_qs
        ).values("customer_id", "type", "amount")

        totals: dict[int, dict] = {}
        for tx in tx_qs:
            entry = totals.setdefault(
                tx["customer_id"], {"total_credit": ZERO, "total_paid": ZERO}
            )
            if tx["type"] == "CREDIT":
                entry["total_credit"] += tx["amount"]
            elif tx["type"] == "PAYMENT":
                entry["total_paid"] += tx["amount"]

        # ── Step 2: identify discrepancies and build update list ──────────────
        to_update = []
        discrepancy_count = 0

        for customer in customer_qs.iterator(chunk_size=batch_size):
            entry = totals.get(customer.pk, {"total_credit": ZERO, "total_paid": ZERO})
            new_credit = entry["total_credit"]
            new_paid = entry["total_paid"]
            new_balance = new_credit - new_paid

            changed = (
                customer.total_credit != new_credit
                or customer.total_paid != new_paid
                or customer.balance != new_balance
            )

            if changed:
                discrepancy_count += 1
                if dry_run:
                    self.stdout.write(
                        f"  [DIFF] Customer pk={customer.pk} ({customer.name!r}): "
                        f"stored=(credit={customer.total_credit}, "
                        f"paid={customer.total_paid}, balance={customer.balance}) "
                        f"→ computed=(credit={new_credit}, paid={new_paid}, "
                        f"balance={new_balance})"
                    )
                else:
                    customer.total_credit = new_credit
                    customer.total_paid = new_paid
                    customer.balance = new_balance
                    to_update.append(customer)

        # ── Step 3: persist in batches ────────────────────────────────────────
        if not dry_run and to_update:
            with db_transaction.atomic():
                for i in range(0, len(to_update), batch_size):
                    batch = to_update[i : i + batch_size]
                    Customer.objects.bulk_update(
                        batch, fields=["total_credit", "total_paid", "balance"]
                    )

        # ── Step 4: summary ───────────────────────────────────────────────────
        if discrepancy_count == 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f"All {total_customers} customer(s) have accurate balances. "
                    "No changes needed."
                )
            )
        elif dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"DRY RUN complete. {discrepancy_count} customer(s) have "
                    "stale balances. Re-run without --dry-run to fix."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Updated {discrepancy_count} customer(s) out of {total_customers}."
                )
            )
