# Generated by Django 3.2.7 on 2022-03-16 22:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('free', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='freetimeactivity',
            name='duration',
            field=models.DurationField(null=True),
        ),
        migrations.AddField(
            model_name='freetimeactivity',
            name='type',
            field=models.CharField(default='unknown', max_length=20),
        ),
    ]
