from rest_framework.generics import RetrieveUpdateDestroyAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Employee
from schedules.serializers import *

class EmployeeDetail(RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_class = (IsAuthenticated, )


class EmployeeShfits(RetrieveUpdateDestroyAPIView):
    queryset = EmployeeShift.objects.all()
    serializer_class = EmployeeShiftSerializer
    permission_class = (IsAuthenticated, )

    def get(self, request, pk):
        employee = Employee.objects.get(pk=pk)
        employee_shifts = employee.employeeshift_set.all()
        serializer = EmployeeShiftSerializer(employee_shifts, many=True)
        return Response(serializer.data)


class WeekDays(RetrieveUpdateDestroyAPIView):
    queryset = EmployeeShift.objects.all()
    serializer_class = WeekDaySeriallizer


class SubAccountsList(RetrieveAPIView):
    queryset = Account.objects.all()
    serializer_class = SubAccountsSerializer

