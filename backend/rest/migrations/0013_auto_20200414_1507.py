# Generated by Django 2.0 on 2020-04-14 13:07

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rest', '0012_sarvouser_agreeddsgvo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sarvouser',
            name='authenticationUser',
            field=models.OneToOneField(default=None, null=True, on_delete=None, to=settings.AUTH_USER_MODEL),
        ),
    ]
