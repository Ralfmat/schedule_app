from rest_framework import serializers
from schedules.models import Shift, ShiftAssignment, Availability, ShiftSwapRequest, WeekDay, Workday
from accounts.models import Account
from accounts.serializers import AccountDetailSerializer

# WeekDay Serializer
class WeekDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeekDay
        fields = ('day_name', 'open_at', 'close_at')

    def validate(self, data):
        # Ensure 'close_at' time is after 'open_at' time
        if data['close_at'] <= data['open_at']:
            raise serializers.ValidationError("Closing time must be after opening time.")
        return data   
# ---

# Workday Serializer
class WorkdaySerializer(serializers.ModelSerializer):
    week_day = WeekDaySerializer(read_only=True)
    
    class Meta:
        model = Workday
        fields = ('date', 'week_day')
# ---

# Shift Serializer and Shift Creation Serializer
class ShiftSerializer(serializers.ModelSerializer):
    workday = WorkdaySerializer(read_only=True)
    
    class Meta:
        model = Shift
        fields = ('id', 'start_time', 'end_time', 'status', 'workday')

class ShiftCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ('id', 'start_time', 'end_time', 'status', 'workday')
    
    def validate(self, data):
        # Check if start time is before end time
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time.")
        
        # Retrieve the associated workday to validate open hours
        workday = data['workday']
        weekday = workday.week_day
        if data['start_time'] < weekday.open_at or data['end_time'] > weekday.close_at:
            raise serializers.ValidationError(
                f"Shift times must be within open hours: {weekday.open_at} - {weekday.close_at}."
            )

        return data
# ---

# Shift Assignment Serializer
class ShiftAssignmentSerializer(serializers.ModelSerializer):
    account = AccountDetailSerializer(read_only=True)
    shift = ShiftSerializer(read_only=True)
    
    class Meta:
        model = ShiftAssignment
        fields = ('account', 'shift')

class ShiftAssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftAssignment
        fields = ('account', 'shift')
# ---

# Shift Swap Request Serializer
class ShiftSwapRequestSerializer(serializers.ModelSerializer):
    requesting_employee = AccountDetailSerializer(read_only=True)
    target_employee = AccountDetailSerializer(read_only=True)
    shift = ShiftSerializer(read_only=True)
    
    class Meta:
        model = ShiftSwapRequest
        fields = ['id', 'requesting_employee', 'target_employee', 'shift', 'status', 'target_employee_approval', 'created_at']
        read_only_fields = ['status', 'created_at']
# ---

# Availability Serializer and Availability Creation Serializer
class AvailabilitySerializer(serializers.ModelSerializer):
    account = AccountDetailSerializer(read_only=True)
    workday = WorkdaySerializer(read_only=True)
    
    class Meta:
        model = Availability
        fields = ('id', 'account', 'start_time', 'end_time', 'workday')

class AvailabilityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ('account', 'start_time', 'end_time', 'workday')
# ---

# Account with Related Shifts and Availability Serializer
class AccountShiftAvailabilitySerializer(serializers.ModelSerializer):
    shiftassignment_set = ShiftAssignmentSerializer(many=True, read_only=True)
    availability_set = AvailabilitySerializer(many=True, read_only=True)
    
    class Meta:
        model = Account
        fields = ('id', 'username', 'role', 'shiftassignment_set', 'availability_set')
# ---