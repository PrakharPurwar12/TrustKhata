from rest_framework import serializers
from .models import Shop

class ShopSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    created_at = serializers.DateTimeField(source='user.date_joined', read_only=True)

    class Meta:
        model = Shop
        fields = ['id', 'name', 'category', 'email', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']
