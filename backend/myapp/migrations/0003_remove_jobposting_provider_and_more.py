# Generated by Django 5.1.3 on 2025-02-17 23:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0002_populate_job_providers'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='jobposting',
            name='provider',
        ),
        migrations.AlterField(
            model_name='jobposting',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='jobposting',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.DeleteModel(
            name='JobProviderProfile',
        ),
    ]
