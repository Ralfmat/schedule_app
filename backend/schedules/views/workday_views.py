from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from schedules.permissions import IsManager
from django.utils import timezone

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
    # permission_class = (IsAuthenticated, IsManager)
    queryset = Workday.objects.all()