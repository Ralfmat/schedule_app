# Generated by Django 4.2.11 on 2024-06-17 08:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('schedules', '0004_remove_shift_manager_manageravailability_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='manager',
            options={'permissions': [('crud_employees', 'Can performe operations on employee model')], 'verbose_name': 'Manager', 'verbose_name_plural': 'Managers'},
        ),
    ]