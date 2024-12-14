# Generated by Django 4.2.11 on 2024-12-08 17:47

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('schedules', '0009_alter_workday_date'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='availability',
            unique_together={('account', 'workday')},
        ),
    ]
