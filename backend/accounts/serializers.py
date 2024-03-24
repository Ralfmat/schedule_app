from rest_framework import serializers
from .models import Account

class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'password')
    
    def create(self, validated_data):
        user = Account.objects.create(username=validated_data['username'],
                                      email=validated_data['email'],
                                      first_name=validated_data['first_name'],
                                      last_name=validated_data['last_name'],
                                      phone_number=validated_data['phone_number'])
        user.set_password(validated_data['password'])
        user.save()
        return user