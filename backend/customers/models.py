from django.db import models
from django.db.models import Q
from users.models import Shop


class Customer(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="customers")
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # ---------------------------------------------------------------------------
    # Denormalized financial totals — kept accurate by signals in transactions/signals.py.
    # Defaults to 0 so existing rows are non-destructively populated by migration 0003.
    # ---------------------------------------------------------------------------
    total_credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["shop", "phone"],
                condition=Q(phone__isnull=False) & ~Q(phone=""),
                name="unique_customer_per_shop_phone",
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.shop.name}"
