from django.http import JsonResponse
from rest_framework.parsers import JSONParser

from rest.models import SarvoEvent, SarvoUser
from rest.views.access_validation._access_validation import access_validation
from rest.views._decorators import login_required_any_views
from django.contrib.auth.models import User



@login_required_any_views
@access_validation
def invite(request):
    if request.method == "POST":

        # get relevant information
        data = JSONParser().parse(request)
        eventId = data["eventId"]
        realPhoneNumber = data["number"].replace(" ", "") # replace potential white spaces
        number = data["hashedNumber"]


        event = SarvoEvent.objects.get(pk = eventId)
        authenticationUser = request.user # requesting user
        inviteesNumber = authenticationUser.username
        suInvitee = SarvoUser.objects.get(phonenumber = inviteesNumber) # username of authentication user is the phone number




        # Create Authentication user
        found = User.objects.filter(username=number)
        if found:  # User exists already -> change password and send new pw
            user = found[0]
        else:
            pw = str(User.objects.make_random_password())+str(User.objects.make_random_password())+str(User.objects.make_random_password())+str(User.objects.make_random_password())+str(User.objects.make_random_password())
            try:
                user = User.objects.create_user(number, password=pw)
            except:
                print("Username already exists")
        user.save()  # stores to db

        # Create SarvoUser
        try:
            su = SarvoUser.objects.get(phonenumber=number)
            if su:
                # sarvouser is already found, link him to authentication user
                su.authenticationUser = user
                if su.isRegistered: # Important if it was true abort misson! Then, this is a malicious invite
                    print("----------------> ABORTING INVITE AS USER IS REGISTERED")
                    return JsonResponse({}, status=200)
                su.isRegistered = False
                su.id = user.id  # authentication and sarvo id should be same
                su.save()
        except:
            su = SarvoUser(name="Invited User", phonenumber=number, isRegistered=False, authenticationUser=user)
            su.id = user.id
            su.save()

        # add the user to the event if not already part#
        if not event.participants.filter(id=su.id).exists():
            event.participants.add(su)
            event.save()

            # SMS sending would be against GDPR -> instead just add his "ID"
            # ones he registers he can access it

        return JsonResponse({}, status=200) # return empty status 200 response

    return JsonResponse({"ERROR": "Bad request, only POST allowed"}, status=400)