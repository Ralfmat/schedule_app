from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from schedules.permissions import IsManager

from schedules.models import *
from schedules.serializers import *

class WeekdayDetailView(RetrieveAPIView):
    # permission_classes = (IsAuthenticated, )
    queryset = Weekday.objects.all()
    serializer_class = WeekdayDetailSerializer

class WeekdayListView(ListAPIView):
    # permission_classes = (IsAuthenticated, )
    queryset = Weekday.objects.all()
    serializer_class = WeekdayDetailSerializer

class WeekdayCreateView(CreateAPIView):
    # permission_class = (IsAuthenticated, IsManager)
    queryset = Weekday.objects.all()
    serializer_class = WeekdayCreateUpdateSerializer

class WeekdayUpdateView(UpdateAPIView):
    # permission_class = (IsAuthenticated, IsManager)
    queryset = Weekday.objects.all()
    serializer_class = WeekdayCreateUpdateSerializer

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class WeekdayDeleteView(DestroyAPIView):
    # permission_class = (IsAuthenticated, IsManager)
    queryset = Weekday.objects.all()
