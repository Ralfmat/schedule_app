# Generated by Django 4.2.11 on 2024-04-01 12:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('schedules', '0003_alter_employee_options_alter_employeeshift_options_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shift',
            name='manager',
        ),
        migrations.CreateModel(
            name='ManagerAvailability',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('manager', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedules.manager')),
                ('workday', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedules.workday')),
            ],
            options={
                'verbose_name': 'Manger availability',
                'verbose_name_plural': 'Manager availabilities',
                'db_table': 'manger_availabilities',
            },
        ),
        migrations.CreateModel(
            name='EmployeeAvailability',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedules.employee')),
                ('workday', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedules.workday')),
            ],
            options={
                'verbose_name': 'Employee availability',
                'verbose_name_plural': 'Employee availabilities',
                'db_table': 'employee_availabilities',
            },
        ),
    ]
