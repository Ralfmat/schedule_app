from django.db import models
from accounts.models import Account

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

    class Meta:
        db_table = 'workday'
        verbose_name = 'Workday'
        verbose_name_plural = 'Workdays'

    def __str__(self) -> str:
        return f"Workday: {self.date}"


class Availability(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    workday = models.ForeignKey('Workday', on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        db_table = 'availabilities'
        verbose_name = 'Availability'
        verbose_name_plural = 'Availabilities'

    def __str__(self) -> str:
        return f"{self.account.username} - {self.workday.date} ({self.start_time}-{self.end_time})"


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


class ShiftAssignment(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)

    class Meta:
        db_table = 'shift_assignments'
        verbose_name = 'Shift Assignment'
        verbose_name_plural = 'Shift Assignments'

    def __str__(self) -> str:
        return f"{self.account.username} assigned to Shift {self.shift.id}"

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

