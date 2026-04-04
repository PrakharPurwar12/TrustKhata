from django.urls import path

from .views import customer_detail_view, customer_list_view

urlpatterns = [
    path("", customer_list_view, name="customer-list"),
    path("<int:customer_id>/", customer_detail_view, name="customer-detail"),
]
