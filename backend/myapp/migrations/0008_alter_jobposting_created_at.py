# Generated by Django 5.1.3 on 2025-06-10 02:48

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0007_userprofile_num_applications'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jobposting',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
