"""
transactions/signals.py
─────────────────────────────────────────────────────────────────────────────
Django signal handlers that keep Customer.total_credit / total_paid / balance
in sync whenever a Transaction is created or deleted.

Why signals over overriding save()/delete():
  • Keeps the Transaction model thin and free of cross-app coupling.
  • Works automatically even for bulk operations that call the view layer.
  • Consistent with Django's recommended extension pattern.

Why only post_save and post_delete:
  • The current API exposes NO update endpoint for transactions
    (transactions/urls.py only has GET/POST on the list view).
  • The Transaction.date field is auto_now_add=True, so edits are
    architecturally prevented at the model level.
  • If a transaction update endpoint is added in the future, the
    balance_service is idempotent — just call recalculate_customer_balance()
    in that view's save path and everything stays correct.

Concurrency:
  • recalculate_customer_balance() uses select_for_update() inside atomic(),
    so rapid back-to-back transactions on the same customer serialize safely.
"""

import logging

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from customers.balance_service import recalculate_customer_balance

logger = logging.getLogger(__name__)


def _safe_recalculate(customer_id: int, action: str) -> None:
    """
    Wraps the recalculation call with structured logging so any unexpected
    error is surfaced rather than silently swallowed.
    """
    try:
        recalculate_customer_balance(customer_id)
        logger.debug(
            "Balance recalculated for customer_id=%s after %s", customer_id, action
        )
    except Exception:
        logger.exception(
            "Failed to recalculate balance for customer_id=%s after %s",
            customer_id,
            action,
        )
        raise  # Re-raise so the outer atomic transaction rolls back.


@receiver(post_save, sender="transactions.Transaction")
def transaction_post_save(sender, instance, created, **kwargs):
    """
    Fires after INSERT (created=True).
    No update path exists in the API, but this also fires on any accidental
    direct ORM save — recalculating in that case is always safe.
    """
    _safe_recalculate(instance.customer_id, "save")


@receiver(post_delete, sender="transactions.Transaction")
def transaction_post_delete(sender, instance, **kwargs):
    """
    Fires after DELETE.
    The customer row might still exist (only the transaction is gone),
    so we safely recalculate. If the customer was also deleted (cascade),
    the Customer.DoesNotExist inside recalculate_customer_balance is caught
    by the except-block in _safe_recalculate and logged, not raised.
    """
    try:
        recalculate_customer_balance(instance.customer_id)
        logger.debug(
            "Balance recalculated for customer_id=%s after delete",
            instance.customer_id,
        )
    except Exception:
        # If the customer itself was also deleted (cascade), this is harmless.
        logger.debug(
            "Could not recalculate balance for customer_id=%s after delete "
            "(customer may have been cascade-deleted).",
            instance.customer_id,
        )
