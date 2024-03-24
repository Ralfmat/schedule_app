from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

# class AccountManager(BaseUserManager):

#     use_in_migrations = True

#     def create_account(self, email, password, **extra_fields):
#         if not email:
#             raise ValueError('Email is required!')
#         user = self.model(email=self.normalize_email(email), **extra_fields)
#         user.set_password(password)
#         user.save(using=self._db)
#         return user
#     def create_superuser(self, email, password, **extra_fields):
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)
#         extra_fields.setdefault('is_active', True)

#         if extra_fields.get('is_staff') is not True:
#             raise ValueError('Superuser must have is_staff = True')
#         if extra_fields.get('is_superuser') is not True:
#             raise ValueError('Superuser must have is_superuser = True')

#         return self.create_user(email, password, **extra_fields)

class Account(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=9, unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'phone_number']

    def __str__(self) -> str:
        return self.username
    