"""
customers/balance_service.py
─────────────────────────────────────────────────────────────────────────────
Single source of truth for recalculating and persisting denormalized financial
totals on a Customer record.

Design principles:
  • Atomic   — wrapped in a DB transaction so partial writes are impossible.
  • Locked   — select_for_update() prevents concurrent requests from producing
               a dirty read and writing a stale balance.
  • Minimal  — touches only the three balance columns; all other fields are
               left untouched (update_fields).
  • Idempotent — can be called as many times as needed and will always converge
                 on the correct value.
"""

from decimal import Decimal

from django.db import transaction
from django.db.models import DecimalField, Q, Sum
from django.db.models.functions import Coalesce

_MONEY_FIELD = DecimalField(max_digits=12, decimal_places=2)
_ZERO = Decimal("0.00")


def recalculate_customer_balance(customer_id: int) -> None:
    """
    Recompute total_credit, total_paid, and balance for the given customer_id
    and persist the result atomically with a row-level lock.

    This function:
    1. Acquires a SELECT FOR UPDATE lock on the Customer row.
    2. Aggregates all related Transaction rows in the same atomic block.
    3. Writes only the three financial columns back (update_fields).

    Raises:
        Customer.DoesNotExist  — if the ID is invalid (caller should handle).
    """
    # Import here to avoid a circular import at module load time.
    from customers.models import Customer  # noqa: PLC0415

    with transaction.atomic():
        # Lock the customer row for the duration of this atomic block.
        # Any concurrent request for the same customer_id will queue here.
        customer = Customer.objects.select_for_update().get(pk=customer_id)

        agg = customer.transactions.aggregate(
            total_credit=Coalesce(
                Sum("amount", filter=Q(type="CREDIT")),
                _ZERO,
                output_field=_MONEY_FIELD,
            ),
            total_paid=Coalesce(
                Sum("amount", filter=Q(type="PAYMENT")),
                _ZERO,
                output_field=_MONEY_FIELD,
            ),
        )

        customer.total_credit = agg["total_credit"]
        customer.total_paid = agg["total_paid"]
        customer.balance = customer.total_credit - customer.total_paid

        customer.save(update_fields=["total_credit", "total_paid", "balance"])
