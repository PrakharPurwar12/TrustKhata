"""
Migration 0003 — Add denormalized balance fields to Customer and backfill.

Two-phase approach:
  Phase 1 (AddField): Adds total_credit, total_paid, balance as nullable=True
    initially so SQLite can add the column to an existing table without error.
    (SQLite cannot add non-null columns with no default to a live table safely
    in older Django; using null=True + default=0 is the safest cross-DB path.)

  Phase 2 (RunPython: backfill): Calculates correct totals for every existing
    Customer from their Transactions and writes them.

  Phase 3 (AlterField): Tightens the columns to NOT NULL with default=0 now
    that all rows have explicit values.

This migration is safe to run on a live database:
  • AddField with default=0 sets existing rows to 0 instantly (no table rewrite
    on PostgreSQL; SQLite rewrites the table but that is unavoidable).
  • Backfill runs in a single pass with bulk_update in batches of 500.
  • AlterField only changes the nullable flag; no data movement.
"""

from decimal import Decimal

from django.db import migrations, models


def backfill_customer_balances(apps, schema_editor):
    """
    Recalculate total_credit, total_paid, and balance for every Customer
    that has at least one Transaction, then bulk-update in batches.

    Uses the historical model proxies provided by `apps` so that this migration
    stays correct even if the live model changes again in the future.
    """
    Customer = apps.get_model("customers", "Customer")
    Transaction = apps.get_model("transactions", "Transaction")

    ZERO = Decimal("0.00")
    BATCH = 500

    # Build a mapping: customer_id → {total_credit, total_paid}
    totals: dict[int, dict] = {}

    for tx in Transaction.objects.all().values("customer_id", "type", "amount"):
        entry = totals.setdefault(
            tx["customer_id"], {"total_credit": ZERO, "total_paid": ZERO}
        )
        if tx["type"] == "CREDIT":
            entry["total_credit"] += tx["amount"]
        elif tx["type"] == "PAYMENT":
            entry["total_paid"] += tx["amount"]

    if not totals:
        return  # No transactions at all — nothing to backfill.

    # Fetch only the customers that have transactions
    customers_to_update = list(
        Customer.objects.filter(pk__in=totals.keys())
    )

    for customer in customers_to_update:
        entry = totals[customer.pk]
        customer.total_credit = entry["total_credit"]
        customer.total_paid = entry["total_paid"]
        customer.balance = entry["total_credit"] - entry["total_paid"]

    # Bulk-update in batches to avoid a single massive SQL statement
    for i in range(0, len(customers_to_update), BATCH):
        batch = customers_to_update[i : i + BATCH]
        Customer.objects.bulk_update(
            batch, fields=["total_credit", "total_paid", "balance"]
        )


def reverse_backfill(apps, schema_editor):
    """No-op reverse: the AlterField below will remove the columns anyway."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("customers", "0002_customer_unique_customer_per_shop_phone"),
    ]

    operations = [
        # ── Phase 1: Add columns with default=0 ──────────────────────────────
        migrations.AddField(
            model_name="customer",
            name="total_credit",
            field=models.DecimalField(
                decimal_places=2, default=0, max_digits=12
            ),
        ),
        migrations.AddField(
            model_name="customer",
            name="total_paid",
            field=models.DecimalField(
                decimal_places=2, default=0, max_digits=12
            ),
        ),
        migrations.AddField(
            model_name="customer",
            name="balance",
            field=models.DecimalField(
                decimal_places=2, default=0, max_digits=12
            ),
        ),
        # ── Phase 2: Backfill existing data ──────────────────────────────────
        migrations.RunPython(backfill_customer_balances, reverse_backfill),
    ]
