from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from schedules.models import Availability
from schedules.serializers import AvailabilityCreateSerializer, AvailabilitySerializer
from schedules.permissions import IsManager


class AvailabilityDetailView(RetrieveAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    # permission_classes = (IsAuthenticated, IsManager) # Ensure only authenticated users can access

    def get_queryset(self):
        # If you want to restrict access to only the owner or managers
        user = self.request.user
        if user.role == 'MANAGER':  # Assuming manager role is defined in your account model
            return Availability.objects.all()
        return Availability.objects.filter(account=user)  # Restrict to user's own entries

class AvailabilityCreateView(CreateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilityCreateSerializer
    # permission_classes = (IsAuthenticated, )

    def perform_create(self, serializer):
        # Link the availability to the authenticated user
        serializer.save(account=self.request.user)

class AvailabilityListView(ListAPIView):
    serializer_class = AvailabilitySerializer
    # permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        # Get the workday ID from the query params and filter availability by it
        workday_id = self.request.query_params.get('workday_id')
        if workday_id:
            return Availability.objects.filter(workday_id=workday_id, account=self.request.user)
        return Availability.objects.none()

class AvailabilityUpdateView(UpdateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilityCreateSerializer
    # permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        # Restrict updates to the logged-in user's availability entries
        return super().get_queryset().filter(account=self.request.user)
    
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
class AvailabilityDeleteView(DestroyAPIView):
    queryset = Availability.objects.all()
    # permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        # Restrict deletion to the logged-in user's availability entries
        return super().get_queryset().filter(account=self.request.user)
