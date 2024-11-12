from django.urls import path
from .views.availability_views import *
from .views.shift_views import *
from .views.weekday_views import *
from .views.workday_views import *
from .views.shifts_assignment_views import *

urlpatterns = [
    path('workdays/', WorkdayListView.as_view(), name='workday-list'),
    path('workdays/create/', WorkdayCreateView.as_view(), name='workday-create'),
    path('workdays/<int:pk>/', WorkdayDetailView.as_view(), name='workday-detail'),
    path('workdays/update/<int:pk>/', WorkdayUpdateView.as_view(), name='workday-update'),
    path('workdays/delete/<int:pk>/', WorkdayDeleteView.as_view(), name='workday-delete'),

    path('weekdays/', WeekdayListView.as_view(), name='weekday-list'),  # Pass boolean future_only query param
    path('weekdays/create/', WeekdayCreateView.as_view(), name='weekday-create'),
    path('weekdays/<int:pk>/', WeekdayDetailView.as_view(), name='weekday-detail'),
    path('weekdays/update/<int:pk>/', WeekdayUpdateView.as_view(), name='weekday-update'),
    path('weekdays/delete/<int:pk>/', WeekdayDeleteView.as_view(), name='weekday-delete'),

    path('availability/', AvailabilityListView.as_view(), name='availability-list'),  # Pass workday_id as query param
    path('availability/create/', AvailabilityCreateView.as_view(), name='availability-create'),
    path('availability/<int:pk>/', AvailabilityDetailView.as_view(), name='availability-detail'),
    path('availability/update/<int:pk>/', AvailabilityUpdateView.as_view(), name='availability-update'),
    path('availability/delete/<int:pk>/', AvailabilityDeleteView.as_view(), name='availability-delete'),

    path('shifts/', ShiftListView.as_view(), name='shift-list'),  # Pass workday_id as query param
    path('shifts/create/', ShiftCreateView.as_view(), name='shift-create'),
    path('shifts/<int:pk>/', ShiftDetailView.as_view(), name='shift-detail'),
    path('shifts/update/<int:pk>/', ShiftUpdateView.as_view(), name='shift-update'),
    path('shifts/delete/<int:pk>/', ShiftDeleteView.as_view(), name='shift-delete'),

    path('assignments/', ShiftAssignmentListView.as_view(), name='assignment-list'),  # Pass workday_id as query param
    path('assignments/create/', ShiftAssignmentCreateView.as_view(), name='assignment-create'),
    path('assignments/<int:pk>/', ShiftAssignmentDetailView.as_view(), name='assignment-detail'),
    path('assignments/update/<int:pk>/', ShiftAssignmentUpdateView.as_view(), name='assignment-update'),
    path('assignments/delete/<int:pk>/', ShiftAssignmentDeleteView.as_view(), name='assignment-delete'),

    # path('shift/assign/', ShiftAssignmentView.as_view(), name='shift_assignment'),
    # path('shift_swap/', ShiftSwapRequestCreateView.as_view(), name='shift_swap_create'),
    # path('shift_swap/<int:pk>/employee_approve/', ShiftSwapEmployeeApprovalView.as_view(), name='shift_swap_employee_approve'),
    # path('shift_swap/<int:pk>/manager_approve/', ShiftSwapManagerApprovalView.as_view(), name='shift_swap_manager_approve'),
]
