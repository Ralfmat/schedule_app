from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from schedules.permissions import IsManager

from schedules.models import *
from schedules.serializers import *

class WeekdayDetailView(RetrieveAPIView):
    # permission_classes = (IsAuthenticated, )
    serializer_class = WeekdayDetailSerializer
    queryset = Weekday.objects.all()

class WeekdayListView(ListAPIView):
    # permission_classes = (IsAuthenticated, )
    serializer_class = WeekdayDetailSerializer
    queryset = Weekday.objects.all()

class WeekdayCreateView(CreateAPIView):
    # permission_class = (IsAuthenticated, IsManager)
    serializer_class = WeekdayCreateUpdateSerializer
    queryset = Weekday.objects.all()

class WeekdayUpdateView(UpdateAPIView):
    # permission_class = (IsAuthenticated, IsManager)
    serializer_class = WeekdayCreateUpdateSerializer
    queryset = Weekday.objects.all()

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class WeekdayDeleteView(DestroyAPIView):
    # permission_class = (IsAuthenticated, IsManager)
    queryset = Weekday.objects.all()
