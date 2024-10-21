from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.models import Account
from schedules.models import *
from schedules.serializers import *
from schedules.permissions import IsManager, IsManagerOrReadOnly

# Shift Assignment View for a Specific Account
class AccountAssignedShiftsView(APIView):
    permission_classes = (IsAuthenticated, IsManagerOrReadOnly)
    serializer_class = ShiftAssignmentSerializer

    def get(self, request, pk):
        try:
            account = Account.objects.get(pk=pk)
        except Account.DoesNotExist:
            return Response({"error": "Account not found."}, status=status.HTTP_404_NOT_FOUND)
        
        shifts = ShiftAssignment.objects.filter(account=account)
        serializer = ShiftAssignmentSerializer(shifts, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk):
        try:
            account = Account.objects.get(pk=pk)
        except Account.DoesNotExist:
            return Response({"error": "Account not found."}, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data.copy()
        data['account'] = account.id  # Ensure the account is set based on the URL pk
        serializer = ShiftAssignmentCreateSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        # Update an existing shift assignment for the specified account
        try:
            shift_assignment = ShiftAssignment.objects.get(pk=request.data.get('id'), account__id=pk)
        except ShiftAssignment.DoesNotExist:
            return Response({"error": "Shift assignment not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ShiftAssignmentCreateSerializer(shift_assignment, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        # Delete a specific shift assignment for the specified account
        shift_assignment_id = request.data.get('id')
        
        try:
            shift_assignment = ShiftAssignment.objects.get(pk=shift_assignment_id, account__id=pk)
        except ShiftAssignment.DoesNotExist:
            return Response({"error": "Shift assignment not found."}, status=status.HTTP_404_NOT_FOUND)
        
        shift_assignment.delete()
        return Response({"message": "Shift assignment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# Workday Shifts Management View
class WorkdayShiftManagementView(APIView):
    # permission_classes = (IsAuthenticated, IsManager)

    def post(self, request, workday_id):
        try:
            workday = Workday.objects.get(id=workday_id)
        except Workday.DoesNotExist:
            return Response({"error": "Workday not found."}, status=status.HTTP_404_NOT_FOUND)

        shift_data = request.data.get('shifts', [])
        created_shifts = []
        errors = []

        for shift_info in shift_data:
            shift_info['workday'] = workday_id
            serializer = ShiftCreateSerializer(data=shift_info)
            if serializer.is_valid():
                shift = serializer.save()
                created_shifts.append(serializer.data)
            else:
                errors.append(serializer.errors)

        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({"created_shifts": created_shifts}, status=status.HTTP_201_CREATED)


# Shift Assignment View
class ShiftAssignmentView(APIView):
    permission_classes = (IsAuthenticated, IsManager)

    def post(self, request):
        # Assign employees to shifts
        serializer = ShiftAssignmentCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Shift Request Views
class ShiftSwapRequestCreateView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        data = request.data.copy()
        data['requesting_employee'] = request.user.id  # Ensure requesting employee is the logged-in user

        # Ensure requesting_employee and target_employee are not the same
        if data.get('target_employee') == str(request.user.id):
            return Response(
                {"error": "You cannot create a swap request with yourself as the target."},
                status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ShiftSwapRequestSerializer(data=data)
        if serializer.is_valid():
            serializer.save(requesting_employee=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ShiftSwapManagerApprovalView(APIView):
    permission_classes = (IsAuthenticated, IsManager)

    def patch(self, request, pk):
        try:
            swap_request = ShiftSwapRequest.objects.get(pk=pk)
            # Ensure manager can approve only if the employee has approved
            if swap_request.target_employee_approval:
                swap_request.status = request.data.get('status', swap_request.status)
                swap_request.save()
                return Response(ShiftSwapRequestSerializer(swap_request).data)
            else:
                return Response({'error': 'Employee approval required first.'}, status=status.HTTP_400_BAD_REQUEST)
        except ShiftSwapRequest.DoesNotExist:
            return Response({'error': 'Swap request not found.'}, status=status.HTTP_404_NOT_FOUND)

class ShiftSwapEmployeeApprovalView(APIView):
    permission_classes = (IsAuthenticated, )

    def patch(self, request, pk):
        try:
            swap_request = ShiftSwapRequest.objects.get(pk=pk)
            # Ensure only the target employee can approve or decline
            if request.user == swap_request.target_employee:
                swap_request.target_employee_approval = request.data.get('target_employee_approval', False)
                swap_request.status = 'EMPLOYEE_APPROVED' if swap_request.target_employee_approval else 'DECLINED'
                swap_request.save()
                return Response(ShiftSwapRequestSerializer(swap_request).data)
            else:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        except ShiftSwapRequest.DoesNotExist:
            return Response({'error': 'Swap request not found.'}, status=status.HTTP_404_NOT_FOUND)


# Auto Schedule Views
class AutoSchedulePreviewView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request, workday_id):
        workday = Workday.objects.get(id=workday_id)
        suggested_schedule = []

        shifts = Shift.objects.filter(workday=workday)
        for shift in shifts:
            # Get employees available for this shift
            available_employees = Availability.objects.filter(
                workday=workday,
                start_time__lte=shift.start_time,
                end_time__gte=shift.end_time
            ).values_list('account', flat=True)[:2]  # Assuming 2 employees per shift

            suggested_schedule.append({
                'shift_id': shift.id,
                'start_time': shift.start_time,
                'end_time': shift.end_time,
                'assigned_employees': available_employees,
            })

        return Response({'suggested_schedule': suggested_schedule})

class FinalizeScheduleView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        schedule_data = request.data.get('schedule', [])
        
        for shift_data in schedule_data:
            shift_id = shift_data.get('shift_id')
            employee_ids = shift_data.get('assigned_employees', [])

            # Clear previous assignments
            ShiftAssignment.objects.filter(shift_id=shift_id).delete()
            
            # Create new assignments based on submitted data
            for employee_id in employee_ids:
                ShiftAssignment.objects.create(account_id=employee_id, shift_id=shift_id)
        
        return Response({'status': 'Schedule finalized successfully.'})
