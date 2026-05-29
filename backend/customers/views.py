"""
customers/views.py
─────────────────────────────────────────────────────────────────────────────
OPTIMIZATION NOTE (2026-05-07):
  Customer financial totals (total_credit, total_paid, balance) are now stored
  as denormalized fields on the Customer model and kept current by signals in
  transactions/signals.py.

  The `annotate_customer_balances` helper is kept here for two reasons:
    1. It is imported and used by users/views.py (dashboard_summary_view).
       That view's own query pattern will be refactored next.
    2. It remains as a fallback in case any test or management command needs it.

  All customer LIST and DETAIL reads now query the plain model fields — no
  GROUP BY / SUM aggregation is required at read time.
"""

from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from backend.api_responses import error_response, success_response
from .models import Customer
from .serializers import CustomerSerializer
from users.models import Shop


# ---------------------------------------------------------------------------
# Legacy annotation helper — retained for dashboard_summary_view in users/views.py
# and for any backfill/admin tooling. No longer called for standard GET endpoints.
# ---------------------------------------------------------------------------
def annotate_customer_balances(queryset):
    """
    Returns a queryset annotated with total_credit, total_payment (alias for
    total_paid), and balance derived from the Transaction table via aggregation.

    This function is now only used by dashboard_summary_view in users/views.py
    which needs an aggregate SUM over all customers to produce the dashboard
    to_get / to_give numbers.  Individual customer GET endpoints now read the
    pre-computed model fields instead.
    """
    from django.db.models import DecimalField, ExpressionWrapper, F, Q, Sum
    from django.db.models.functions import Coalesce

    _MONEY_FIELD = DecimalField(max_digits=12, decimal_places=2)

    return queryset.annotate(
        _total_credit_agg=Coalesce(
            Sum('transactions__amount', filter=Q(transactions__type='CREDIT')),
            0,
            output_field=_MONEY_FIELD,
        ),
        _total_payment_agg=Coalesce(
            Sum('transactions__amount', filter=Q(transactions__type='PAYMENT')),
            0,
            output_field=_MONEY_FIELD,
        ),
    ).annotate(
        balance_agg=ExpressionWrapper(
            F('_total_credit_agg') - F('_total_payment_agg'),
            output_field=_MONEY_FIELD,
        )
    )


# ---------------------------------------------------------------------------
# Customer List — GET / POST
# ---------------------------------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def customer_list_view(request):
    try:
        shop = request.user.shop
    except (Shop.DoesNotExist, AttributeError):
        return error_response(
            "No shop associated with user",
            code="shop_missing",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    if request.method == "GET":
        # ── OPTIMIZED: reads pre-computed balance fields; no aggregation JOIN ──
        customers_qs = Customer.objects.filter(shop=shop).order_by('-created_at')

        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get("page_size", 20)
        paginated_customers = paginator.paginate_queryset(customers_qs, request)

        serializer = CustomerSerializer(paginated_customers, many=True)
        return success_response({
            "results": serializer.data,
            "count": customers_qs.count(),
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
        })

    if request.method == "POST":
        serializer = CustomerSerializer(
            data=request.data, context={"request": request, "shop": shop}
        )
        if serializer.is_valid():
            try:
                instance = serializer.save()
                # A newly created customer always has balance=0, but we still
                # re-fetch so the serializer reads from the saved model instance.
                fresh = Customer.objects.get(pk=instance.pk)
                response_serializer = CustomerSerializer(fresh)

                response = success_response(
                    response_serializer.data, status=status.HTTP_201_CREATED
                )
                if serializer.warning_message:
                    response["X-API-Warning"] = serializer.warning_message
                return response
            except IntegrityError:
                return error_response(
                    "Customer already exists with this phone number",
                    code="already_exists",
                    details={"phone": ["Customer already exists with this phone number"]},
                )
        return error_response(
            "Validation failed", code="validation_error", details=serializer.errors
        )


# ---------------------------------------------------------------------------
# Customer Detail — GET / PATCH / DELETE
# ---------------------------------------------------------------------------

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def customer_detail_view(request, customer_id):
    try:
        shop = request.user.shop
    except (Shop.DoesNotExist, AttributeError):
        return error_response("No shop associated with user", code="shop_missing")

    if request.method == "GET":
        try:
            # ── OPTIMIZED: plain queryset — no aggregation ──
            customer = Customer.objects.filter(id=customer_id, shop=shop).first()
            if not customer:
                return error_response(
                    "Customer not found", code="not_found",
                    status_code=status.HTTP_404_NOT_FOUND,
                )
            serializer = CustomerSerializer(customer)
            return success_response(serializer.data)
        except Exception as e:
            return error_response(str(e), code="customer_fetch_failed")

    if request.method == "DELETE":
        try:
            customer = Customer.objects.get(pk=customer_id, shop=shop)
        except Customer.DoesNotExist:
            return error_response(
                "Customer not found", code="not_found",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == "PATCH":
        customer = Customer.objects.filter(id=customer_id, shop=shop).first()
        if not customer:
            return error_response(
                "Customer not found", code="not_found",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        serializer = CustomerSerializer(
            customer,
            data=request.data,
            partial=True,
            context={"request": request, "shop": shop},
        )
        if serializer.is_valid():
            serializer.save()
            return success_response(serializer.data)
        return error_response(
            "Validation failed", code="validation_error", details=serializer.errors
        )
