from rest_framework import serializers
from .models import Customer

def normalize_phone(value):
    digits = ''.join(filter(str.isdigit, str(value or "")))
    if digits.startswith("91") and len(digits) == 12:
        return digits[2:]
    return digits


class CustomerSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False, allow_blank=False)
    phone = serializers.CharField(required=False, allow_blank=False)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_credit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_payment = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.warning_message = None

    class Meta:
        model = Customer
        fields = ["id", "shop", "name", "phone", "balance", "total_credit", "total_payment", "created_at"]
        read_only_fields = ["id", "shop", "balance", "total_credit", "total_payment", "created_at"]

    def validate_name(self, value):
        normalized_name = value.strip()
        if not normalized_name and self.instance is None:
            raise serializers.ValidationError("Name is required.")
        return normalized_name

    def validate_phone(self, value):
        digits = normalize_phone(value)
        if not digits and self.instance is None:
            raise serializers.ValidationError("Phone number is required.")
        
        if digits:
            if len(digits) != 10:
                raise serializers.ValidationError("Phone number must be exactly 10 digits.")
            if digits[0] not in "6789":
                raise serializers.ValidationError("Enter a valid Indian mobile number.")
        return digits

    def validate(self, attrs):
        request = self.context.get("request")
        shop = self.context.get("shop")

        if shop is None and request is not None and getattr(request.user, "is_authenticated", False):
            try:
                shop = request.user.shop
            except AttributeError:
                shop = None

        if shop is None:
            return attrs

        # Final calculated values (merging new attrs with existing instance)
        name = attrs.get("name", self.instance.name if self.instance else "").strip()
        phone = normalize_phone(attrs.get("phone", self.instance.phone if self.instance else ""))

        if not name:
            raise serializers.ValidationError({"name": "Name is required"})

        if not phone:
            raise serializers.ValidationError({"phone": "Phone is required"})

        if len(phone) != 10 or phone[0] not in "6789":
            raise serializers.ValidationError({"phone": "Enter a valid 10-digit mobile number"})

        # Duplicate check scoped to shop
        qs = Customer.objects.filter(shop=shop, phone=phone)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError({
                "phone": ["Customer already exists with this phone number"]
            })

        # Soft warning for name
        if not self.instance or (name.lower() != self.instance.name.lower()):
            if Customer.objects.filter(shop=shop, name__iexact=name).exclude(pk=self.instance.pk if self.instance else None).exists():
                self.warning_message = "A customer with this name already exists in your shop."

        # Assign back cleaned/computed values
        attrs["name"] = name
        attrs["phone"] = phone
        attrs["shop"] = shop
        
        return attrs
