from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from schedules.models import Shift
from schedules.serializers import ShiftCreateSerializer, ShiftSerializer
from schedules.permissions import IsManager

class ShiftListView(ListAPIView):
    serializer_class = ShiftSerializer
    # permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        workday_id = self.request.query_params.get('workday_id')
        return Shift.objects.filter(workday_id=workday_id)

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