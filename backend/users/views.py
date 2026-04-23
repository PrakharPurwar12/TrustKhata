from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import DecimalField, Q, Sum, Case, When, F, Value, ExpressionWrapper
from django.db.models.functions import Coalesce
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from backend.api_responses import error_response, success_response
from .models import Shop
from .serializers import ShopSerializer


MONEY_FIELD = DecimalField(max_digits=10, decimal_places=2)

@api_view(["GET"])
@authentication_classes([])
@permission_classes([])
@ensure_csrf_cookie
def csrf_token_view(request):
    return success_response({"csrfToken": get_token(request)})


@api_view(["POST"])
@authentication_classes([])
@permission_classes([])
def register_view(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')
    shop_name = data.get('shop_name', 'My Shop')
    
    if not email or not password:
        return error_response("Email and password required", code="validation_error", status_code=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=email).exists():
        return error_response("User already exists", code="already_exists", status_code=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create_user(username=email, email=email, password=password)
    Shop.objects.create(user=user, name=shop_name)
    
    login(request, user)
    get_token(request)
    return success_response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)

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
        get_token(request)
        try:
            shop = Shop.objects.get(user=user)
        except Shop.DoesNotExist:
            shop = Shop.objects.create(user=user, name=f"{user.username}'s Shop")
        return success_response(ShopSerializer(shop).data)
    else:
        return error_response("Invalid credentials", code="invalid_credentials")

@api_view(["POST"])
@authentication_classes([])
@permission_classes([])
def logout_view(request):
    logout(request)
    return success_response({"message": "Logged out successfully"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_auth_view(request):
    try:
        shop = Shop.objects.get(user=request.user)
        return success_response(ShopSerializer(shop).data)
    except Shop.DoesNotExist:
        return error_response("Shop not found for user", code="not_found", status_code=status.HTTP_404_NOT_FOUND)

@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Unified endpoint for Merchant Profile management.
    """
    try:
        shop = request.user.shop
    except (Shop.DoesNotExist, AttributeError):
        # Create a shop if it somehow doesn't exist
        shop = Shop.objects.create(user=request.user, name=f"{request.user.username}'s Shop")

    if request.method == "GET":
        return success_response(ShopSerializer(shop).data)

    if request.method == "PUT":
        serializer = ShopSerializer(shop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(serializer.data)
        return error_response("Update failed", code="validation_error", details=serializer.errors)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_shop_view(request):
    try:
        shop = request.user.shop
        shop.name = request.data.get('shop_name', shop.name)
        shop.category = request.data.get('category', shop.category)
        shop.save()
        return success_response(ShopSerializer(shop).data)
    except Exception as e:
        return error_response(str(e), code="update_failed")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary_view(request):
    try:
        shop = request.user.shop
    except (Shop.DoesNotExist, AttributeError):
        return Response({"to_get": 0.0, "to_give": 0.0}, status=status.HTTP_200_OK)

    try:
        from customers.models import Customer
        from customers.views import annotate_customer_balances

        # Annotate customers with balance
        customers = annotate_customer_balances(
            Customer.objects.filter(shop=shop)
        )

        # Aggregate based on net balance per customer
        agg = customers.aggregate(
            to_get=Coalesce(
                Sum(
                    Case(
                        When(balance__gt=0, then=F('balance')),
                        default=Value(0),
                        output_field=MONEY_FIELD
                    )
                ),
                0,
                output_field=MONEY_FIELD
            ),
            to_give=Coalesce(
                Sum(
                    Case(
                        When(balance__lt=0, then=-F('balance')),
                        default=Value(0),
                        output_field=MONEY_FIELD
                    )
                ),
                0,
                output_field=MONEY_FIELD
            )
        )
        return success_response(agg)
    except Exception as e:
        return error_response(str(e), code="summary_failed")
