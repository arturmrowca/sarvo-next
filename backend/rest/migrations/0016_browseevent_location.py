# Generated by Django 2.0 on 2020-04-16 09:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rest', '0015_auto_20200415_2348'),
    ]

    operations = [
        migrations.AddField(
            model_name='browseevent',
            name='location',
            field=models.CharField(blank=True, default='Empty', max_length=100),
        ),
    ]
