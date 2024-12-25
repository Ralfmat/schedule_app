from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from schedules.permissions import IsManager
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status

from schedules.models import Workday
from schedules.serializers import WorkdayCreateUpdateSerializer, WorkdayDetailSerializer

class WorkdayDetailView(RetrieveAPIView):
    # permission_classes = (IsAuthenticated, )
    queryset = Workday.objects.all()
    serializer_class = WorkdayDetailSerializer

class WorkdayListView(ListAPIView):
    # permission_classes = (IsAuthenticated, )
    serializer_class = WorkdayDetailSerializer

    def get_queryset(self):
        today = timezone.now().date()
        queryset = Workday.objects.all()
        
        # Check for 'future_only' query parameter
        future_only = self.request.query_params.get('future_only', 'false').lower() == 'true'
        if future_only:
            queryset = queryset.filter(date__gte=today)
        
        return queryset

class WorkdayCreateView(CreateAPIView):
    # permission_class = (IsAuthenticated, IsManager)
    queryset = Workday.objects.all()
    serializer_class = WorkdayCreateUpdateSerializer

class WorkdayUpdateView(UpdateAPIView):
    # permission_class = (IsAuthenticated, IsManager)
    queryset = Workday.objects.all()
    serializer_class = WorkdayCreateUpdateSerializer

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class WorkdayDeleteView(DestroyAPIView):
    # permission_classes = (IsAuthenticated, IsManager)
    queryset = Workday.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.date < timezone.now().date():
            return Response(
                {"detail": "Workdays in the past cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)