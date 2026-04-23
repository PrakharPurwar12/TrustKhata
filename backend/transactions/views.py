from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from backend.api_responses import error_response, success_response
from customers.models import Customer
from users.models import Shop
from .models import Transaction
from .serializers import TransactionSerializer

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def transaction_list_view(request):
    try:
        shop = request.user.shop
    except (Shop.DoesNotExist, AttributeError):
        return error_response("No shop profile", code="shop_missing")

    transactions_qs = Transaction.objects.filter(customer__shop=shop).select_related('customer').order_by('-date')
    customer_id = request.query_params.get("customer")

    if customer_id:
        try:
            customer_id = int(customer_id)
        except (TypeError, ValueError):
            return error_response("Invalid customer filter", code="validation_error")
        transactions_qs = transactions_qs.filter(customer_id=customer_id)

    if request.method == "GET":
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get("page_size", 20)
        paginated_transactions = paginator.paginate_queryset(transactions_qs, request)
        
        serializer = TransactionSerializer(paginated_transactions, many=True)
        return success_response({
            "results": serializer.data,
            "count": transactions_qs.count(),
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link()
        })

    if request.method == "POST":
        customer_id = request.data.get("customer")

        if customer_id in (None, ""):
            return error_response(
                "Transaction validation failed",
                code="validation_error",
                details={"customer": ["This field is required."]},
            )

        if not Customer.objects.filter(id=customer_id, shop=shop).exists():
            return error_response("Customer does not belong to your shop", code="forbidden_customer")

        serializer = TransactionSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return success_response(serializer.data, status=status.HTTP_201_CREATED)
        return error_response(
            "Transaction validation failed",
            code="validation_error",
            details=serializer.errors,
        )
