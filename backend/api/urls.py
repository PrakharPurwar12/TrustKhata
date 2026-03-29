from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, TransactionViewSet, dashboard_view

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_view, name='dashboard'),
]
