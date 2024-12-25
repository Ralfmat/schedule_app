from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from schedules.models import Shift
from schedules.serializers import ShiftCreateSerializer, ShiftSerializer
from schedules.permissions import IsManager
from django.utils import timezone

class ShiftListView(ListAPIView):
    serializer_class = ShiftSerializer
    # permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        today = timezone.now().date()
        queryset = Shift.objects.all()

        # Filter by workday_id if provided
        workday_id = self.request.query_params.get('workday_id')
        if workday_id:
            queryset = queryset.filter(workday_id=workday_id)

        # Check for 'future_only' query parameter
        future_only = self.request.query_params.get('future_only', 'false').lower() == 'true'
        if future_only:
            queryset = queryset.filter(workday__date__gte=today)

        return queryset

class ShiftCreateView(CreateAPIView):
    queryset = Shift.objects.all()
    serializer_class = ShiftCreateSerializer
    # permission_classes = (IsAuthenticated, IsManager)

    def perform_create(self, serializer):
        # Save shift for a specific workday
        serializer.save()

class ShiftDetailView(RetrieveAPIView):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    # permission_classes = (IsAuthenticated, )

class ShiftUpdateView(UpdateAPIView):
    queryset = Shift.objects.all()
    serializer_class = ShiftCreateSerializer
    # permission_classes = (IsAuthenticated, IsManager)

    def perform_update(self, serializer):
        # Update shift with manager access only
        serializer.save()
    
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class ShiftDeleteView(DestroyAPIView):
    queryset = Shift.objects.all()
    # permission_classes = (IsAuthenticated, IsManager)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Check if the shift is in the past
        if instance.date < timezone.now().date():
            return Response(
                {"detail": "Shifts in the past cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)