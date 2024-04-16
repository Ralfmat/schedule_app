from rest_framework import serializers
from schedules.models import *
from accounts.serializers import AccountDetailSerializer


# Manager
class ManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = ('account', )


class ManagerDetailSerializer(serializers.ModelSerializer):
    account = AccountDetailSerializer(read_only=True)

    class Meta:
        model = Manager
        fields = ('account', )


# Employee
class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ('account', )


class EmployeeDetailSerializer(serializers.ModelSerializer):
    account = AccountDetailSerializer(read_only=True)
    
    class Meta:
        model = Employee
        fields = ('account', )


# Week day
class WeekDaySeriallizer(serializers.ModelSerializer):
    class Meta:
        model = WeekDay
        fields = ('day_name', 'open_at', 'close_at')


# Workday
class WorkdaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Workday
        fields = ('date', 'week_day')


class WorkdayDetailSerializer(serializers.ModelSerializer):
    week_day = WeekDaySeriallizer(read_only=True)

    class Meta:
        model = Workday
        fields = ('date', 'week_day')


# Shift
class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ('start_time', 'end_time', 'workday')


class ShiftDetailSerializer(serializers.ModelSerializer):
    workday = WorkdayDetailSerializer(read_only=True)
    manager = ManagerDetailSerializer(read_only=True)

    class Meta:
        model = Shift
        fields = ('start_time', 'end_time', 'workday')


# Employee shift
class EmployeeShiftSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    shift = ShiftSerializer(read_only=True)

    class Meta:
        model = EmployeeShift
        fields = ('employee', 'shift')


# Manager shift
class ManagerShiftSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    shift = ShiftSerializer(read_only=True)

    class Meta:
        model = ManagerShift
        fields = ('manager', 'shift')


# Employee availability
class EmployeeAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeAvailability
        fields = ('start_time', 'end_time', 'employee', 'workday')


class EmployeeAvailabilityDetailSerializer(serializers.ModelSerializer):
    workday = WorkdayDetailSerializer(read_only=True)

    class Meta:
        model = EmployeeAvailability
        fields = ('start_time', 'end_time', 'employee', 'workday')


# Manager availability
class ManagerAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagerAvailability
        fields = ('start_time', 'end_time', 'manager', 'workday')

    
class ManagerAvailabilitySerializer(serializers.ModelSerializer):
    workday = WorkdayDetailSerializer(read_only=True)
    
    class Meta:
        model = ManagerAvailability
        fields = ('start_time', 'end_time', 'manager', 'workday')


# Account types
class SubAccountsSerializer(serializers.ModelSerializer):
    employee_set = EmployeeSerializer(many=True, read_only=True)
    manager_set = ManagerSerializer(many=True, read_only=True)

    class Meta:
        model = Account
        fields = ('employee_set',
                  'manager_set')
