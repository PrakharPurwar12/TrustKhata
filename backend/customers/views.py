from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Customer
from .serializers import CustomerSerializer
from users.models import Shop

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def customer_list_view(request):
    try:
        shop = request.user.shop
    except AttributeError:
        return Response({"error": "No shop associated with user"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        customers = Customer.objects.filter(shop=shop).order_by('-created_at')
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        data = request.data.copy()
        data["shop"] = shop.id
        serializer = CustomerSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_detail_view(request, customer_id):
    try:
        shop = request.user.shop
        customer = Customer.objects.get(id=customer_id, shop=shop)
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)
    except (Customer.DoesNotExist, AttributeError):
        return Response(status=status.HTTP_404_NOT_FOUND)
