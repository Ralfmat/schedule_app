from rest_framework import permissions
from rest_framework import status
from rest_framework.generics import RetrieveUpdateDestroyAPIView, CreateAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import Account
from accounts.serializers import *

class AccountRegistration(CreateAPIView):
    serializer_class = AccountSerializer
    permission_class = (permissions.AllowAny, )


class AccountDetail(RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountDetailSerializer
    permission_class = (permissions.IsAuthenticated, )


class GetCurrentUserId(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request):
        user = request.user
        return Response({'id': user.id})


class ListAccounts(ListAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountDetailSerializer
    permission_class = (permissions.IsAuthenticated, )


class HomeView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request):
        content = {'message': 'Home view response. You are authenticated!'}
        return Response(content)


class LogoutView(APIView):
    permission_classes = (permissions.AllowAny, )
    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST, data=e)
