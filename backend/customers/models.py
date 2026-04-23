from django.db import models
from django.db.models import Q
from users.models import Shop

class Customer(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="customers")
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
