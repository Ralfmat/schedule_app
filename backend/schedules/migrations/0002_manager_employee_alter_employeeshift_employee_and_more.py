# Generated by Django 4.2.11 on 2024-03-30 13:25

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('schedules', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Manager',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterField(
            model_name='employeeshift',
            name='employee',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedules.employee'),
        ),
        migrations.AlterField(
            model_name='managershift',
            name='manager',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedules.manager'),
        ),
        migrations.AlterField(
            model_name='shift',
            name='manager',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedules.manager'),
        ),
    ]