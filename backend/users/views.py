from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Shop
from .serializers import ShopSerializer

@api_view(["POST"])
@authentication_classes([])
@permission_classes([])
def register_view(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')
    shop_name = data.get('shop_name', 'My Shop')
    
    if not email or not password:
        return Response({"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=email).exists():
        return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create_user(username=email, email=email, password=password)
    Shop.objects.create(user=user, name=shop_name)
    
    login(request, user)
    return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@authentication_classes([])
@permission_classes([])
def login_view(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')
    
    user = authenticate(request, username=email, password=password)
    if user is not None:
        login(request, user)
        shop = Shop.objects.get(user=user)
        return Response(ShopSerializer(shop).data, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@authentication_classes([])
@permission_classes([])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_auth_view(request):
    try:
        shop = Shop.objects.get(user=request.user)
        return Response(ShopSerializer(shop).data, status=status.HTTP_200_OK)
    except Shop.DoesNotExist:
        return Response({"error": "Shop not found for user"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_shop_view(request):
    try:
        shop = request.user.shop
        shop.name = request.data.get('shop_name', shop.name)
        shop.category = request.data.get('category', shop.category)
        shop.save()
        return Response(ShopSerializer(shop).data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
