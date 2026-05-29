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

        # ── OPTIMIZED: reads pre-computed Customer.balance field ──────────────
        # Previously this aggregated all Transaction rows via a multi-table JOIN.
        # Now it aggregates over the Customer table using the denormalized field.
        # One SUM per positive/negative bucket over the Customers table only.
        agg = Customer.objects.filter(shop=shop).aggregate(
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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def insights_view(request):
    """
    Single endpoint powering the /insights page.
    Query param: range = 7 | 30 | 90 (default: 30)
    """
    try:
        shop = request.user.shop
    except Exception:
        return error_response("No shop profile", code="shop_missing")

    try:
        from customers.models import Customer
        from transactions.models import Transaction
        from django.utils import timezone
        from django.db.models.functions import TruncDate

        try:
            days = int(request.query_params.get("range", 30))
            if days not in (7, 30, 90):
                days = 30
        except (TypeError, ValueError):
            days = 30

        since = timezone.now() - timezone.timedelta(days=days)
        _MONEY = DecimalField(max_digits=12, decimal_places=2)
        _INT = DecimalField(max_digits=10, decimal_places=0)

        customers_qs = Customer.objects.filter(shop=shop)

        # Daily credit / payment trend
        trend_qs = (
            Transaction.objects.filter(customer__shop=shop, date__gte=since)
            .annotate(day=TruncDate("date"))
            .values("day", "type")
            .annotate(total=Sum("amount"))
            .order_by("day")
        )
        trend_map = {}
        for row in trend_qs:
            key = str(row["day"])
            if key not in trend_map:
                trend_map[key] = {"date": key, "credit": 0.0, "payment": 0.0}
            if row["type"] == "CREDIT":
                trend_map[key]["credit"] = float(row["total"])
            else:
                trend_map[key]["payment"] = float(row["total"])
        trend = sorted(trend_map.values(), key=lambda x: x["date"])

        # Top debtors
        top_debtors = list(
            customers_qs.filter(balance__gt=0)
            .order_by("-balance")[:8]
            .values("id", "name", "phone", "balance")
        )
        for d in top_debtors:
            d["balance"] = float(d["balance"])

        # Recent transactions
        recent_qs = (
            Transaction.objects.filter(customer__shop=shop)
            .select_related("customer")
            .order_by("-date")[:15]
        )
        recent_transactions = [
            {
                "id": tx.id, "amount": float(tx.amount), "type": tx.type,
                "date": tx.date.isoformat(), "note": tx.note or "",
                "customer_id": tx.customer_id, "customer_name": tx.customer.name,
            }
            for tx in recent_qs
        ]

        # Aggregate totals from denormalized Customer fields
        agg = customers_qs.aggregate(
            total_credit=Coalesce(Sum("total_credit"), 0, output_field=_MONEY),
            total_paid=Coalesce(Sum("total_paid"), 0, output_field=_MONEY),
            total_outstanding=Coalesce(
                Sum(Case(When(balance__gt=0, then=F("balance")), default=Value(0), output_field=_MONEY)),
                0, output_field=_MONEY
            ),
            active_customers=Coalesce(
                Sum(Case(When(balance__gt=0, then=Value(1)), default=Value(0), output_field=_INT)),
                0, output_field=_INT
            ),
            settled_customers=Coalesce(
                Sum(Case(When(balance__lte=0, then=Value(1)), default=Value(0), output_field=_INT)),
                0, output_field=_INT
            ),
        )
        total_credit = float(agg["total_credit"] or 0)
        total_paid = float(agg["total_paid"] or 0)
        total_outstanding = float(agg["total_outstanding"] or 0)
        active_customers = int(agg["active_customers"] or 0)
        settled_customers = int(agg["settled_customers"] or 0)
        recovery_rate = round((total_paid / total_credit * 100) if total_credit > 0 else 0, 1)

        period_agg = Transaction.objects.filter(
            customer__shop=shop, type="PAYMENT", date__gte=since
        ).aggregate(total=Coalesce(Sum("amount"), 0, output_field=_MONEY))
        period_recovery = float(period_agg["total"] or 0)

        return success_response({
            "trend": trend,
            "top_debtors": top_debtors,
            "recent_transactions": recent_transactions,
            "totals": {
                "total_outstanding": total_outstanding,
                "total_recovered": total_paid,
                "total_given": total_credit,
                "period_recovery": period_recovery,
                "active_customers": active_customers,
                "settled_customers": settled_customers,
                "recovery_rate": recovery_rate,
                "range_days": days,
            },
        })
    except Exception as e:
        return error_response(str(e), code="insights_failed")
