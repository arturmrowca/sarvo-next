from django.db import models


class SessionCacheModel(models.Model): #user=many -
    #id = models.IntegerField(primary_key=True)# given implicitly
    user_id = models.IntegerField() # information cached for current user
    session_id = models.CharField(max_length=100, blank=True, default="Empty") # device for cache
    created = models.DateTimeField() # time created
    json_content = models.CharField(max_length=10000000) # cached json content
    url =  models.CharField(max_length=200) # cached url
    status_code = models.IntegerField(default=200)
    body_hash = models.CharField(max_length=200) # body hash
