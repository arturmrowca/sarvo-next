# Generated by Django 3.2.6 on 2021-08-16 10:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0004_post_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='country',
            field=models.CharField(default='', max_length=100),
        ),
        migrations.AddField(
            model_name='post',
            name='region',
            field=models.CharField(default='', max_length=100),
        ),
    ]
