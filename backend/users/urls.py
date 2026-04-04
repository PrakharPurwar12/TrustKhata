from django.urls import path
from .views import register_view, login_view, logout_view, check_auth_view, update_shop_view, dashboard_summary_view

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('me/', check_auth_view, name='check_auth'),
    path('update_shop/', update_shop_view, name='update_shop'),
    path('summary/', dashboard_summary_view, name='summary'),
]
