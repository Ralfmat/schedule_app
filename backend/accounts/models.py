from django.db import models
from django.contrib.auth.models import AbstractUser

class Account(AbstractUser):
    ROLE_CHOICES = (
        ('MANAGER', 'Manager'),
        ('EMPLOYEE', 'Employee')
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=20, unique=True)
    phone_number = models.CharField(max_length=9, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EMPLOYEE')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ('username', 'phone_number', 'first_name', 'last_name', 'role')

    def __str__(self) -> str:
        return self.email
    
