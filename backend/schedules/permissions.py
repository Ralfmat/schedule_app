from rest_framework.permissions import BasePermission

class IsManager(BasePermission):
    """
    Custom permission to grant access only to users with the 'MANAGER' role.
    Return True if user role is manager, False otherwise.
    """
    def has_permission(self, request, view):
        return request.user.role == 'MANAGER'

class IsManagerOrReadOnly(BasePermission):
    """
    Custom permission to only allow managers to access non-GET methods.
    """
    def has_permission(self, request, view):
        # Allow all authenticated users to access GET requests
        if request.method == 'GET':
            return request.user.is_authenticated

        # Allow only managers to access other methods
        return request.user.is_authenticated and request.user.role == 'MANAGER'
