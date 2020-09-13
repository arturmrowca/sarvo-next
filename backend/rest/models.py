from django.contrib.auth.models import User
from django.db import models


class SarvoUser(models.Model): #user=many -
    #id = models.IntegerField(primary_key=True)# given implicitly
    name = models.CharField(max_length=100, blank=True, default="Empty")
    phonenumber = models.CharField(max_length=150, blank=True, default="Empty")
    profilePictureBase64 = models.CharField(max_length=10000000, blank=True, default="Empty")
    profilePicturePreviewBase64 = models.CharField(max_length=1000000, blank=True, default="Empty")
    createdProfileDate = models.DateTimeField(default="2000-12-23T00:00:00Z")  # given implicitly
    role = models.CharField(max_length=50, blank=True, default="user")

    # if user is not registered, no authentication user is available
    isRegistered = models.BooleanField(blank=True, default = True)
    connectToCalendar = models.BooleanField(blank=True, default = False)

    agreedDSGVO = models.CharField(max_length=50, blank=True, default="0") # version of dsgvo that was agreed
    authenticationUser = models.OneToOneField(User, default=None, null=True, on_delete=None)

class Device(models.Model):
    sarvoUser = models.ForeignKey(SarvoUser, related_name="user", default=-1, on_delete=models.CASCADE)  # device is assigned one user
    token = models.CharField(max_length=1000, blank=True, default="Empty")
    platform = models.CharField(max_length=50, blank=True, default="Empty") # android ios browser

class Contacts(models.Model):
    sarvoUser = models.OneToOneField(SarvoUser, on_delete=models.CASCADE)
    contacts = models.ManyToManyField(SarvoUser, related_name="contactsSarvo")


class SarvoEvent(models.Model):
    #id = models.IntegerField(primary_key=True)  # given implicitly
    name = models.CharField(max_length=100, blank=True, default="Empty")
    organizer = models.ForeignKey(SarvoUser, related_name="organizer", default=-1, on_delete=models.CASCADE)  # given implicitly
    location = models.CharField(max_length=150, blank=True, default="Empty")
    imageBase64 = models.CharField(max_length=1000000, blank=True, default="Empty")
    imagePreviewBase64 = models.CharField(max_length=1000000, blank=True, default="Empty")
    fixed_date = models.DateTimeField(default="2000-12-23T00:00:00Z")  # given implicitly
    description = models.CharField(max_length=50000, blank=True, default="Empty")
    organization_status = models.CharField(max_length=50, blank=True, default="Empty")
    fixed_date_option_id = models.IntegerField(default=-1)
    participants = models.ManyToManyField(SarvoUser, related_name="participants")

    # possible_dates -> DateOptions where event_id = myId

class DateOption(models.Model):
    date = models.CharField(max_length=100, blank=True, default="Empty")
    notification_status = models.CharField(max_length=100, blank=True, null=True, default="Empty")

    # foreign keys
    event = models.ForeignKey(SarvoEvent, on_delete=models.CASCADE)

    # foreign keys
    acc_participants = models.ManyToManyField(SarvoUser, related_name="acc_participants")
    inter_participants = models.ManyToManyField(SarvoUser, related_name="inter_participants")
    dec_participants = models.ManyToManyField(SarvoUser, related_name="dec_participants")

class BrowseEvent(models.Model):
    date = models.CharField(max_length=100, blank=True, default="Empty")#date: "23.03.2020 - 13:00 Mi"
    title  = models.CharField(max_length=100, blank=True, default="Empty")# title: "The feast of the long titles celebrating a long title"
    image = models.CharField(max_length=1000000, blank=True, default="Empty") # image
    description = models.CharField(max_length=50000, blank=True, default="Empty") # description: funny text
    starChosen = models.BooleanField(blank=True, default = True) # starChosen: False, True
    categoryTitle = models.CharField(max_length=100, blank=True, default="Empty")# categoryTitle: Sport
    location = models.CharField(max_length=100, blank=True, default="Empty")# categoryTitle: Sport


class SarvoEventChat(models.Model):
    event = models.OneToOneField(SarvoEvent, on_delete=models.CASCADE)

class EventChatMessage(models.Model):
    sender = models.ForeignKey(SarvoUser, on_delete=models.CASCADE)
    text = models.CharField(max_length=5000)
    eventChat = models.ForeignKey(SarvoEventChat, on_delete=models.CASCADE)
    receivedBy = models.ManyToManyField(SarvoUser, "received_by", blank=True)
    readBy = models.ManyToManyField(SarvoUser, "read_by", blank=True)
    sentTime = models.DateTimeField(default="2000-12-23T00:00:00Z")

class SarvoGroup(models.Model):
    name = models.CharField(max_length=100, default="Empty")
    imageBase64 = models.CharField(max_length=10000000, default="Empty", blank=True)
    imagePreviewBase64 = models.CharField(max_length=1000000, default="Empty", blank=True)
    description = models.CharField(max_length=5000, default="Empty")
    members = models.ManyToManyField(SarvoUser, "members", blank=True)
    admins = models.ManyToManyField(SarvoUser, "admins", blank=True)
    created = models.DateTimeField()
    events = models.ManyToManyField(SarvoEvent, "events", blank=True) # events in which group participates


class SimpleContent(models.Model):
    dateReceived = models.CharField(max_length=100, default="Empty")
    content = models.CharField(max_length=5000, default="Empty")
    project = models.CharField(max_length=50, default="Empty")