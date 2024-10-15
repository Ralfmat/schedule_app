from django.contrib import admin
from .models import *

admin.site.register(WeekDay)
admin.site.register(Workday)
admin.site.register(Shift)
admin.site.register(ShiftAssignment)
admin.site.register(ShiftSwapRequest)
admin.site.register(Availability)