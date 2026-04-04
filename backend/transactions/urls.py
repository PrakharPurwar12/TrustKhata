from django.urls import path

from .views import transaction_list_view

urlpatterns = [
    path("", transaction_list_view, name="transaction-list"),
]
