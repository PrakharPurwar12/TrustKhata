from django.db import migrations, models
from django.db.models import Q


def deduplicate_customers_by_shop_phone(apps, schema_editor):
    Customer = apps.get_model("customers", "Customer")
    Transaction = apps.get_model("transactions", "Transaction")

    duplicate_groups = (
        Customer.objects.exclude(phone__isnull=True)
        .exclude(phone="")
        .values("shop_id", "phone")
        .annotate(customer_count=models.Count("id"))
        .filter(customer_count__gt=1)
    )

    for group in duplicate_groups:
        customers = list(
            Customer.objects.filter(
                shop_id=group["shop_id"],
                phone=group["phone"],
            ).order_by("created_at", "id")
        )

        primary_customer = customers[0]
        duplicate_customers = customers[1:]

        for duplicate_customer in duplicate_customers:
            Transaction.objects.filter(customer_id=duplicate_customer.id).update(
                customer_id=primary_customer.id
            )
            duplicate_customer.delete()


class Migration(migrations.Migration):

    dependencies = [
        ("customers", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            deduplicate_customers_by_shop_phone,
            migrations.RunPython.noop,
        ),
        migrations.AddConstraint(
            model_name="customer",
            constraint=models.UniqueConstraint(
                fields=("shop", "phone"),
                condition=Q(phone__isnull=False) & ~Q(phone=""),
                name="unique_customer_per_shop_phone",
            ),
        ),
    ]
