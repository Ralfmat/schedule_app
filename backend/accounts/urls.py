from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('accounts', ListAccounts.as_view(), name="accounts"),
    path('account/register', AccountRegistration.as_view(), name="sign_up"),
    path('account/me', AccountMeView.as_view(), name="current_user"),
    path('account/<int:pk>', AccountDetail.as_view(), name="account_detail"),
    path('account/login', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('account/login/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('account/logout', LogoutView.as_view(), name='logout'),
    path('home', HomeView.as_view(), name='home'),
]
