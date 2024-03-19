from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate 
from accounts.models import Account
from accounts.serializers import AccountSerializer

class AccountRegistration(generics.CreateAPIView):
    serializer_class = AccountSerializer
    permission_class = [permissions.AllowAny]

class AccountDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_class = [permissions.IsAuthenticated]

class ListAccounts(generics.ListAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_class = [permissions.AllowAny]
