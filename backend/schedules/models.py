from django.db import models
from accounts.models import Account


class Employee(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    class Meta:
        db_table = 'employee'
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'

    def __str__(self) -> str:
        return f"Employee: {self.account}"


class Manager(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    class Meta:
        db_table = 'managers'
        verbose_name = 'Manager'
        verbose_name_plural = 'Managers'
        permissions = [
            ("crud_employees", "Can performe operations on employee model")
        ]

    def __str__(self) -> str:
        return f"Manager: {self.account}"

    
class WeekDay(models.Model):
    day_name = models.CharField(max_length=50)
    open_at = models.TimeField()
    close_at = models.TimeField()

    class Meta:
        db_table = 'week_days'
        verbose_name = 'Week day'
        verbose_name_plural = 'Week days'

    def __str__(self) -> str:
        return f"Week day: {self.day_name}"


class Workday(models.Model):
    date = models.DateField()
    week_day = models.ForeignKey(WeekDay, on_delete=models.CASCADE)

    class Meta:
        db_table = 'workday'
        verbose_name = 'Workday'
        verbose_name_plural = 'Workdays'

    def __str__(self) -> str:
        return f"Workday: {self.date}"


class Shift(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    workday = models.ForeignKey(Workday, on_delete=models.CASCADE)

    class Meta:
        db_table = 'shifts'
        verbose_name = 'Shift'
        verbose_name_plural = 'Shifts'

    def __str__(self) -> str:
        return f"Shift: {self.id}"


class EmployeeShift(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)

    class Meta:
        db_table = 'employee_shifts'
        verbose_name = 'Employee shift'
        verbose_name_plural = 'Employee shifts'

    def __str__(self) -> str:
        return f"Employee shift: {self.employee.account.username} - {self.shift.id}"


class ManagerShift(models.Model):
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE)
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)

    class Meta:
        db_table = 'manager_shifts'
        verbose_name = 'Manager shift'
        verbose_name_plural = 'Manager shifts'

    def __str__(self) -> str:
        return f"Manager shift: {self.manager.account.username} - {self.shift.id}"
    

class EmployeeAvailability(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    workday = models.ForeignKey(Workday, on_delete=models.CASCADE)

    class Meta:
        db_table = 'employee_availabilities'
        verbose_name = 'Employee availability'
        verbose_name_plural = 'Employee availabilities'

    def __str__(self) -> str:
        return f"Employee availability: {self.employee.account.username} - {self.workday.date}"
    


class ManagerAvailability(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE)
    workday = models.ForeignKey(Workday, on_delete=models.CASCADE)

    class Meta:
        db_table = 'manger_availabilities'
        verbose_name = 'Manger availability'
        verbose_name_plural = 'Manager availabilities'

    