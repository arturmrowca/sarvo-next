# -*- coding: utf-8 -*-
# Generated by Django 1.11.18 on 2019-11-20 09:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rest', '0008_auto_20191118_0328'),
    ]

    operations = [
        migrations.AddField(
            model_name='dateoption',
            name='notification_status',
            field=models.CharField(blank=True, default='Empty', max_length=100),
        ),
    ]
