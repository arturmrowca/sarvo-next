# -*- coding: utf-8 -*-
# Generated by Django 1.11.18 on 2019-06-12 18:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rest', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sarvoevent',
            name='imagePreviewBase64',
            field=models.CharField(blank=True, default='Empty', max_length=10000),
        ),
    ]
