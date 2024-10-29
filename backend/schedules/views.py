from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.models import Account
from schedules.models import *
from schedules.serializers import *
from schedules.permissions import IsManager, IsManagerOrReadOnly

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
