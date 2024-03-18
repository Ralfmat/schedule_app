from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from serializers import AccountSerializer

class AccountRegistration(generics.CreateAPIView):
    serializer_class = AccountSerializer
    permission_classes = [permissions.AllowAny]

class AccountLoginView(APIView):
    def post(self, request):
        user = authenticate(username=request.data['username'], 
                            password=request.data['password'])
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        else:
            return Response({'error': 'Invalid credentials'}, status=401)
        