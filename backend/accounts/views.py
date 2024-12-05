from rest_framework import permissions
from rest_framework import status
from rest_framework.generics import RetrieveUpdateDestroyAPIView, CreateAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from accounts.models import Account
from accounts.serializers import *

class AccountRegistration(CreateAPIView):
    serializer_class = AccountSerializer
    permission_class = (permissions.AllowAny, )


class AccountDetail(RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountDetailSerializer
    # permission_class =

    def get_queryset(self):
        user = self.request.user
        if user.role == 'MANAGER':
            return Account.objects.all()
        return Account.objects.filter(account=user)
    
class AccountMeView(APIView):
    permission_class = (IsAuthenticated, )

    def get(self, request):
        user = request.user
        serializer = AccountDetailSerializer(user)
        return Response(serializer.data)
        

class GetCurrentUserId(APIView):

    def get(self, request):
        user = request.user
        return Response({'id': user.id})


class ListAccounts(ListAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountDetailSerializer


class HomeView(APIView):

    def get(self, request):
        content = {'message': 'Home view response. You are authenticated!'}
        return Response(content)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST, data=e)
