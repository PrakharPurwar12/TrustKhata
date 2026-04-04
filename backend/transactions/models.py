from django.db import models
from customers.models import Customer

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('CREDIT', 'Credit (Gave)'),
        ('PAYMENT', 'Payment (Got)'),
    )
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    date = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.type} of {self.amount} for {self.customer.name}"
