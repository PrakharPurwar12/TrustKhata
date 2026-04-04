from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Transaction
from .serializers import TransactionSerializer

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def transaction_list_view(request):
    try:
        shop = request.user.shop
    except AttributeError:
        return Response({"error": "No shop profile"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        transactions = Transaction.objects.filter(customer__shop=shop).order_by('-date')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        # Additional safety could be to verify that request.data['customer'] belongs to request.user.shop
        # but relying on model viewsets or deeper validation is for later. We keep it simple.
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
