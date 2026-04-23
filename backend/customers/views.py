from django.db import IntegrityError
from django.db.models import DecimalField, ExpressionWrapper, F, Q, Sum
from django.db.models.functions import Coalesce
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from backend.api_responses import error_response, success_response
from .models import Customer
from .serializers import CustomerSerializer
from users.models import Shop


MONEY_FIELD = DecimalField(max_digits=10, decimal_places=2)


def annotate_customer_balances(queryset):
    return queryset.annotate(
        total_credit=Coalesce(
            Sum('transactions__amount', filter=Q(transactions__type='CREDIT')),
            0,
            output_field=MONEY_FIELD,
        ),
        total_payment=Coalesce(
            Sum('transactions__amount', filter=Q(transactions__type='PAYMENT')),
            0,
            output_field=MONEY_FIELD,
        ),
    ).annotate(
        balance=ExpressionWrapper(
            F('total_credit') - F('total_payment'),
            output_field=MONEY_FIELD,
        )
    )

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def customer_list_view(request):
    try:
        shop = request.user.shop
    except (Shop.DoesNotExist, AttributeError):
        return error_response("No shop associated with user", code="shop_missing", status_code=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        customers_qs = annotate_customer_balances(
            Customer.objects.filter(shop=shop)
        ).order_by('-created_at')

        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get("page_size", 20)
        paginated_customers = paginator.paginate_queryset(customers_qs, request)
        
        serializer = CustomerSerializer(paginated_customers, many=True)
        return success_response({
            "results": serializer.data,
            "count": total_count if 'total_count' in locals() else queryset.count() if 'queryset' in locals() else customers_qs.count(),
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link()
        })

    if request.method == "POST":
        serializer = CustomerSerializer(data=request.data, context={"request": request, "shop": shop})
        if serializer.is_valid():
            try:
                instance = serializer.save()
                # Re-fetch with annotations for the response
                annotated_instance = annotate_customer_balances(
                    Customer.objects.filter(pk=instance.pk, shop=shop)
                ).first()
                response_serializer = CustomerSerializer(annotated_instance)
                
                response = success_response(response_serializer.data, status=status.HTTP_201_CREATED)
                if serializer.warning_message:
                    response["X-API-Warning"] = serializer.warning_message
                return response
            except IntegrityError:
                return error_response(
                    "Customer already exists with this phone number", 
                    code="already_exists",
                    details={"phone": ["Customer already exists with this phone number"]}
                )
        return error_response("Validation failed", code="validation_error", details=serializer.errors)

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def customer_detail_view(request, customer_id):
    try:
        shop = request.user.shop
    except (Shop.DoesNotExist, AttributeError):
        return error_response("No shop associated with user", code="shop_missing")

    if request.method == "GET":
        try:
            customer = annotate_customer_balances(
                Customer.objects.filter(id=customer_id, shop=shop)
            ).first()
            if not customer:
                return error_response("Customer not found", code="not_found", status_code=status.HTTP_404_NOT_FOUND)
                
            serializer = CustomerSerializer(customer)
            return success_response(serializer.data)
        except Exception as e:
            return error_response(str(e), code="customer_fetch_failed")

    if request.method == "DELETE":
        try:
            # Use objects.get and shop=shop for strict security
            customer = Customer.objects.get(pk=customer_id, shop=shop)
        except Customer.DoesNotExist:
            return error_response("Customer not found", code="not_found", status_code=status.HTTP_404_NOT_FOUND)

        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == "PATCH":
        customer = Customer.objects.filter(id=customer_id, shop=shop).first()
        if not customer:
            return error_response("Customer not found", code="not_found", status_code=status.HTTP_404_NOT_FOUND)
            
        serializer = CustomerSerializer(customer, data=request.data, partial=True, context={"request": request, "shop": shop})
        if serializer.is_valid():
            serializer.save()
            return success_response(serializer.data)
        return error_response("Validation failed", code="validation_error", details=serializer.errors)
