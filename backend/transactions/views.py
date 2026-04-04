from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET", "POST"])
def transaction_list_view(request):
    if request.method == "GET":
        return Response([])

    payload = request.data.copy()
    payload["id"] = 1
    return Response(payload, status=status.HTTP_201_CREATED)
