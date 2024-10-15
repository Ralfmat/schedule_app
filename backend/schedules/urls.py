from django.urls import path
from .views import *

urlpatterns = [
    # path('account/<int:pk>/', AccountShiftsAvailabilityView.as_view(), name='account_shifts_availability'),
    path('account/<int:pk>/assigned_shifts/', AccountAssignedShiftsView.as_view(), name='account_assigned_shifts'),
    path('weekdays/<int:pk>/', WeekDayDetailView.as_view(), name='weekday_detail'),
    path('workday/<int:workday_id>/shifts/', WorkdayShiftManagementView.as_view(), name='workday_shift_management'),
    path('shift/assign/', ShiftAssignmentView.as_view(), name='shift_assignment'),
    path('shift_swap/', ShiftSwapRequestCreateView.as_view(), name='shift_swap_create'),
    path('shift_swap/<int:pk>/employee_approve/', ShiftSwapEmployeeApprovalView.as_view(), name='shift_swap_employee_approve'),
    path('shift_swap/<int:pk>/manager_approve/', ShiftSwapManagerApprovalView.as_view(), name='shift_swap_manager_approve'),
]
