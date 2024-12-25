from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView, RetrieveAPIView
from schedules.models import ShiftAssignment
from schedules.serializers import ShiftAssignmentCreateSerializer, ShiftAssignmentSerializer
from rest_framework.permissions import IsAuthenticated
from schedules.permissions import IsManager
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

class ShiftAssignmentCreateView(CreateAPIView):
    queryset = ShiftAssignment.objects.all()
    serializer_class = ShiftAssignmentCreateSerializer
    permission_classes = (IsAuthenticated, IsManager)  # Only managers can assign shifts

class ShiftAssignmentListView(ListAPIView):
    serializer_class = ShiftAssignmentSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        workday_id = self.request.query_params.get('workday_id')  # Query parameter to filter by workday ID
        shift_id = self.request.query_params.get('shift_id')  # Query parameter to filter by shift ID
        all_users = self.request.query_params.get('all_users', 'false').lower() == 'true'  # Query parameter to fetch all users' assignments
        future_only = self.request.query_params.get('future_only', 'false').lower() == 'true'  # Query parameter to filter future assignments

        # Determine if fetching all assignments or just the current user's
        if all_users:
            queryset = ShiftAssignment.objects.all()
        else:
            queryset = ShiftAssignment.objects.filter(account=self.request.user)

        # Apply workday_id filter if provided
        if workday_id:
            queryset = queryset.filter(shift__workday_id=workday_id)

        # Apply shift_id filter if provided
        if shift_id:
            queryset = queryset.filter(shift_id=shift_id)

        if future_only:
            queryset = queryset.filter(shift__workday__date__gte=timezone.now().date())

        return queryset

class ShiftAssignmentDetailView(RetrieveAPIView):
    queryset = ShiftAssignment.objects.all()
    serializer_class = ShiftAssignmentSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        # Filter the queryset to allow only managers or the assigned employee to access
        user = self.request.user
        if user.role == 'MANAGER':
            return ShiftAssignment.objects.all()
        return ShiftAssignment.objects.filter(account=user)

class ShiftAssignmentUpdateView(UpdateAPIView):
    queryset = ShiftAssignment.objects.all()
    serializer_class = ShiftAssignmentCreateSerializer
    permission_classes = (IsAuthenticated, IsManager)  # Only managers can update assignments

    def perform_update(self, serializer):
        # Update shift assignment
        serializer.save()

class ShiftAssignmentDeleteView(DestroyAPIView):
    queryset = ShiftAssignment.objects.all()
    permission_classes = (IsAuthenticated, IsManager)  # Only managers can delete assignments

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.shift.workday.date < timezone.now().date():
            return Response(
                {"detail": "Assignments for shifts in the past cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)