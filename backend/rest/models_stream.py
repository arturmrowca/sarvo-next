from django.db import models


class UserClickStreamModel(models.Model): #user=many -
    #id = models.IntegerField(primary_key=True)# given implicitly
    user_id = models.IntegerField()
    session_id = models.CharField(max_length=100)
    device_id = models.CharField(max_length=100, blank=True, default="Empty")
    interface_element_id = models.CharField(max_length=100, blank=True, default="Empty")
    timestamp = models.DateTimeField()
    pixel_location_x = models.IntegerField()
    pixel_location_y = models.IntegerField()
    click_type = models.CharField(max_length=100)
    next_page = models.CharField(max_length=100, default="Unknown")
    current_page = models.CharField(max_length=100)

class BasicFeedbackFormModel(models.Model):
    rating = models.IntegerField()
    category = models.CharField(max_length=50)
    text = models.CharField(max_length=1000)