# Generated by Django 3.2.7 on 2022-03-16 23:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('free', '0004_alter_freetimeactivity_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='freetimeactivity',
            name='category_level_1',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='freetimeactivity',
            name='category_level_2',
            field=models.CharField(max_length=100, null=True),
        ),
    ]