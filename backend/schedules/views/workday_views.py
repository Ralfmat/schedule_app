from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from schedules.permissions import IsManager

from schedules.models import Workday
from schedules.serializers import WorkdayCreateUpdateSerializer, WorkdayDetailSerializer

class WorkdayDetailView(RetrieveAPIView):
    # permission_classes = (IsAuthenticated, )
    queryset = Workday.objects.all()
    serializer_class = WorkdayDetailSerializer

class WorkdayListView(ListAPIView):
    # permission_classes = (IsAuthenticated, )
    queryset = Workday.objects.all()
    serializer_class = WorkdayDetailSerializer

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