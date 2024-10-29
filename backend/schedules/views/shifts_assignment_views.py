from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView, RetrieveAPIView
from schedules.models import ShiftAssignment
from schedules.serializers import ShiftAssignmentCreateSerializer, ShiftAssignmentSerializer
from rest_framework.permissions import IsAuthenticated
from schedules.permissions import IsManager

class ShiftAssignmentCreateView(CreateAPIView):
    queryset = ShiftAssignment.objects.all()
    serializer_class = ShiftAssignmentCreateSerializer
    # permission_classes = (IsAuthenticated, IsManager)  # Only managers can assign shifts

class ShiftAssignmentListView(ListAPIView):
    serializer_class = ShiftAssignmentSerializer
    # permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        user = self.request.user
        workday_id = self.request.query_params.get('workday_id')

        # Managers can see all assignments, while employees can see only their own
        if user.role == 'MANAGER':
            queryset = ShiftAssignment.objects.all()
        else:
            queryset = ShiftAssignment.objects.filter(account=user)

        # Filter by workday_id if provided
        if workday_id:
            queryset = queryset.filter(shift__workday_id=workday_id)
        
        return queryset

class ShiftAssignmentDetailView(RetrieveAPIView):
    queryset = ShiftAssignment.objects.all()
    serializer_class = ShiftAssignmentSerializer
    # permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        # Filter the queryset to allow only managers or the assigned employee to access
        user = self.request.user
        if user.role == 'MANAGER':  # Assuming your account model has a 'role' field for managers
            return ShiftAssignment.objects.all()
        return ShiftAssignment.objects.filter(account=user)

class ShiftAssignmentUpdateView(UpdateAPIView):
    queryset = ShiftAssignment.objects.all()
    serializer_class = ShiftAssignmentCreateSerializer
    # permission_classes = (IsAuthenticated, IsManager)  # Only managers can update assignments

    def perform_update(self, serializer):
        # Update shift assignment
        serializer.save()

class ShiftAssignmentDeleteView(DestroyAPIView):
    queryset = ShiftAssignment.objects.all()
    # permission_classes = (IsAuthenticated, IsManager)  # Only managers can delete assignments