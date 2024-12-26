from django.db import models
from django.forms import ValidationError
from accounts.models import Account
from django.utils.timezone import now

class Weekday(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday')
    ]

    day_name = models.CharField(max_length=50, choices=DAY_CHOICES)
    open_at = models.TimeField()
    close_at = models.TimeField()

    class Meta:
        db_table = 'week_days'
        verbose_name = 'Week day'
        verbose_name_plural = 'Week days'

    def __str__(self) -> str:
        return f"Week day: {self.day_name}"


class Workday(models.Model):
    date = models.DateField(unique=True)
    week_day = models.ForeignKey(Weekday, on_delete=models.CASCADE)
    is_enrolment_open = models.BooleanField(default=True)

    class Meta:
        db_table = 'workday'
        verbose_name = 'Workday'
        verbose_name_plural = 'Workdays'

    def __str__(self) -> str:
        return f"Workday: {self.date}"
    
    def clean(self):
        if self.date < now().date():
            raise ValidationError("Cannot modify a workday that is in the past.")


class Availability(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    workday = models.ForeignKey('Workday', on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        db_table = 'availabilities'
        verbose_name = 'Availability'
        verbose_name_plural = 'Availabilities'
        unique_together = ['account', 'workday']

    def __str__(self) -> str:
        return f"{self.account.username} - {self.workday.date} ({self.start_time}-{self.end_time})"
    
    def clean(self):
        if self.date < now().date():
            raise ValidationError("Cannot modify a Availability that is in the past.")


class Shift(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    workday = models.ForeignKey('Workday', on_delete=models.CASCADE)

    class Meta:
        db_table = 'shifts'
        verbose_name = 'Shift'
        verbose_name_plural = 'Shifts'

    def __str__(self) -> str:
        return f"Shift: {self.id} ({self.start_time}-{self.end_time})"
    
    def clean(self):
        if self.date < now().date():
            raise ValidationError("Cannot modify a Shift that is in the past.")


class ShiftAssignment(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)

    class Meta:
        db_table = 'shift_assignments'
        verbose_name = 'Shift Assignment'
        verbose_name_plural = 'Shift Assignments'

    def __str__(self) -> str:
        return f"{self.account.username} assigned to Shift {self.shift.id}"
    
    def clean(self):
        if self.date < now().date():
            raise ValidationError("Cannot modify a Shift Assignment that is in the past.")

class ShiftSwapRequest(models.Model):
    SHIFT_SWAP_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('EMPLOYEE_APPROVED', 'Employee Approved'),
        ('MANAGER_APPROVED', 'Manager Approved'),
        ('DECLINED', 'Declined')
    )
    
    requesting_employee = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='requested_swaps')
    target_employee = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='swap_targets')
    shift = models.ForeignKey('Shift', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=SHIFT_SWAP_STATUS_CHOICES, default='PENDING')
    target_employee_approval = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shift_swap_requests'
        verbose_name = 'Shift Swap Request'
        verbose_name_plural = 'Shift Swap Requests'

    def __str__(self):
        return f"{self.requesting_employee.username} requests to swap with {self.target_employee.username} for Shift {self.shift.id}"
    
    def clean(self):
        if self.date < now().date():
            raise ValidationError("Cannot modify a workday that is in the past.")

