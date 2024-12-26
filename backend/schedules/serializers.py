from rest_framework import serializers
from schedules.models import Shift, ShiftAssignment, Availability, ShiftSwapRequest, Weekday, Workday
from accounts.models import Account
from accounts.serializers import AccountDetailSerializer
from django.utils.timezone import now

# Weekday Serializer
class WeekdayCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weekday
        fields = ('day_name', 'open_at', 'close_at')

    def validate(self, data):
        # Ensure 'close_at' time is after 'open_at' time
        if data['close_at'] <= data['open_at']:
            raise serializers.ValidationError("Closing time must be after opening time.")
        return data

class WeekdayDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weekday
        fields = ('id', 'day_name', 'open_at', 'close_at')
# ---

# Workday Serializers
class WorkdayDetailSerializer(serializers.ModelSerializer):
    week_day = WeekdayDetailSerializer(read_only=True)
    
    class Meta:
        model = Workday
        fields = ('id', 'date', 'week_day', 'is_enrolment_open')

class WorkdayCreateUpdateSerializer(serializers.ModelSerializer):
    week_day = serializers.PrimaryKeyRelatedField(queryset=Weekday.objects.all())

    class Meta:
        model = Workday
        fields = ['date', 'week_day', 'is_enrolment_open']

    def validate(self, data):
        if data['date'] < now().date():
            raise serializers.ValidationError("Cannot create a workday in the past.")
        return data
# ---

# Availability Serializer
class AvailabilitySerializer(serializers.ModelSerializer):
    account = AccountDetailSerializer(read_only=True)
    workday = WorkdayDetailSerializer(read_only=True)
    
    class Meta:
        model = Availability
        fields = ('id', 'account', 'start_time', 'end_time', 'workday')

class AvailabilityCreateSerializer(serializers.ModelSerializer):
    # Use PrimaryKeyRelatedField to expect only the ID for foreign key fields
    account_id = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), source='account')
    workday_id = serializers.PrimaryKeyRelatedField(queryset=Workday.objects.all(), source='workday')

    class Meta:
        model = Availability
        fields = ('account_id', 'start_time', 'end_time', 'workday_id')

    def validate(self, data):
        errors = {}

        # Check if start time is before end time
        if data['start_time'] >= data['end_time']:
            errors['start_time'] = "End time must be after start time."

        # Retrieve the associated workday using the mapped 'workday' field
        workday = data['workday']
        weekday = workday.week_day

        # Ensure start time is after open time
        if data['start_time'] < weekday.open_at:
            errors['start_time'] = f"Start time must be after the opening time: {weekday.open_at}."

        # Ensure end time is before close time
        if data['end_time'] > weekday.close_at:
            errors['end_time'] = f"End time must be before the closing time: {weekday.close_at}."

        # If there are any errors, raise ValidationError with the unified key
        if errors:
            raise serializers.ValidationError({"error_messages": errors})
        
        if workday.date < now().date():
            raise serializers.ValidationError("Availability cannot be created for past dates.")


        return data
# ---

# Shift Serializer
class ShiftSerializer(serializers.ModelSerializer):
    workday = WorkdayDetailSerializer(read_only=True)
    
    class Meta:
        model = Shift
        fields = ('id', 'start_time', 'end_time', 'workday')

class ShiftCreateSerializer(serializers.ModelSerializer):
    workday_id = serializers.PrimaryKeyRelatedField(queryset=Workday.objects.all(), source='workday')

    class Meta:
        model = Shift
        fields = ('id', 'start_time', 'end_time', 'workday_id')
    
    def validate(self, data):
        # Check if start time is before end time
        if data['start_time'] >= data['end_time']:
            #TODO - raise errors the way it's done in AvailabilityCreateSerializer
            raise serializers.ValidationError("End time must be after start time.")
        
        # Retrieve the associated workday to validate open hours
        workday = data['workday']
        weekday = workday.week_day
        if data['start_time'] < weekday.open_at or data['end_time'] > weekday.close_at:
            raise serializers.ValidationError(
                f"Shift times must be within open hours: {weekday.open_at} - {weekday.close_at}."
            )
        
        # Check if the shift starts in the past
        if workday.date < now().date():
            raise serializers.ValidationError("Shifts cannot be created for past dates.")

        return data
# ---

# Shift Assignment Serializer
class ShiftAssignmentSerializer(serializers.ModelSerializer):
    account = AccountDetailSerializer(read_only=True)  # For detailed account info
    shift = ShiftSerializer(read_only=True)            # For detailed shift info
    
    class Meta:
        model = ShiftAssignment
        fields = ['id', 'account', 'shift']

class ShiftAssignmentCreateSerializer(serializers.ModelSerializer):
    account_id = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), source='account')
    shift_id = serializers.PrimaryKeyRelatedField(queryset=Shift.objects.all(), source='shift')

    class Meta:
        model = ShiftAssignment
        fields = ['id', 'account_id', 'shift_id']

    def validate(self, data):
        # Retrieve the shift to check its date
        shift = data['shift']
        if shift.workday.date < now().date():
            raise serializers.ValidationError("Assignments cannot be made for shifts in the past.")

        return data
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

# Account with Related Shifts and Availability Serializer
class AccountShiftAvailabilitySerializer(serializers.ModelSerializer):
    shiftassignment_set = ShiftAssignmentSerializer(many=True, read_only=True)
    availability_set = AvailabilitySerializer(many=True, read_only=True)
    
    class Meta:
        model = Account
        fields = ('id', 'username', 'role', 'shiftassignment_set', 'availability_set')
# ---

