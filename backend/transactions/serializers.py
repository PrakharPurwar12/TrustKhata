from rest_framework import serializers
from customers.models import Customer
from users.models import Shop
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['date']

    def validate_customer(self, customer):
        request = self.context.get("request")

        if request is None or not request.user.is_authenticated:
            return customer

        try:
            shop = request.user.shop
        except Shop.DoesNotExist:
            raise serializers.ValidationError("Authenticated user does not have a shop.")
        except AttributeError:
            raise serializers.ValidationError("Authenticated user does not have a shop.")

        if customer.shop_id != shop.id:
            raise serializers.ValidationError("Customer does not belong to your shop.")

        return customer

    def validate_amount(self, amount):
        if amount <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return amount

    def validate_type(self, value):
        valid_choices = {choice for choice, _label in Transaction.TRANSACTION_TYPES}
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Type must be one of: {', '.join(sorted(valid_choices))}."
            )
        return value

    def validate(self, attrs):
        missing_fields = []
        for field_name in ("customer", "amount", "type"):
            if attrs.get(field_name) in (None, ""):
                missing_fields.append(field_name)

        if missing_fields:
            raise serializers.ValidationError(
                {field: ["This field is required."] for field in missing_fields}
            )

        return attrs
