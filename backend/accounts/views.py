from rest_framework import generics, permissions
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
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
    permission_class = [permissions.IsAuthenticated]

class HomeView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request):
        content = {'message': 'Home view response. You are authenticated!'}
        return Response(content)

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated, )
    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST, data=e)