from django.urls import path
from .views import *


urlpatterns = [
    path('employee/<int:pk>', EmployeeDetail.as_view(), name='employee account'),
    path('employee/<int:pk>/shifts', EmployeeShfits.as_view(), name='employee account'),
    path('manager/<int:pk>', ManagerDetail.as_view(), name='manager account'),
    path("account/<int:pk>/sub-accounts", SubAccountsList.as_view(), name="accounts_types"),
]
