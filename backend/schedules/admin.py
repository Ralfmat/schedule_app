from django.contrib import admin
from .models import *

admin.site.register(WeekDay)
admin.site.register(Workday)
admin.site.register(Shift)
admin.site.register(EmployeeShift)
admin.site.register(ManagerShift)
admin.site.register(Employee)
admin.site.register(Manager)
admin.site.register(EmployeeAvailability)
admin.site.register(ManagerAvailability)