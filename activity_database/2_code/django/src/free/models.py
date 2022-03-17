from datetime import datetime
from django.core.validators import FileExtensionValidator
from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.
from truv import settings

class FreetimeActivity(models.Model):
    # Runtime information
    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=20, default="unknown") # anytime,
    valid_until = models.DateTimeField(null=True)
    created = models.DateTimeField(default=datetime.now, blank=True)

    # Basic information
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=1000)
    activity_duration = models.DurationField(null=True, blank=True)
    activity_date = models.DateTimeField(null=True, blank=True)
    image = models.ImageField(null=True, blank=True)
    video = models.FileField(upload_to=settings.MEDIA_ROOT,null=True,
                         validators=[FileExtensionValidator(allowed_extensions=['MOV','avi','mp4','webm','mkv'])], blank=True)

    # category assignment
    category_level_1 = models.CharField(max_length=100, null=True, blank=True) # can be assigned categories
    category_level_2 = models.CharField(max_length=100, null=True, blank=True) # can be assigned subcategories

    # Filter information
    tags = ArrayField(models.CharField(max_length=32, blank=True), null=True, blank=True) # family, active, easy, ...
    activity_complexity = ArrayField(models.CharField(max_length=32, blank=True), null=True, blank=True) # Komplexitaet (was brauch ich dazu? Ist es weit weg…)

    # Reference to original post
    original_url = models.URLField(max_length=500, default="", blank=True)

    def __str__(self):
        return self.title
