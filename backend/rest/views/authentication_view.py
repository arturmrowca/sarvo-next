'''
LOGIN LOGOUT SESSION TEST
Open Postman and run
    Login

'''
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import logout
from rest_framework.parsers import JSONParser

from engine.authentication.sms import SMS
from engine.consent.gdpr_and_user_consent import GdprAndUserConsent
from rest.models import SarvoUser
from rest.views.access_validation._access_validation import access_validation
from rest.views._decorators import message_defaults, login_required_any_views
from rest.views.user_view import extract_user_id
from time import gmtime, strftime

from PIL import Image
from io import BytesIO
import base64
from resizeimage import resizeimage

@login_required_any_views
@access_validation
def update(request):
    # get SarvoUser Id by phonenumber
    user_id = extract_user_id(request)
    if user_id is None:
        return JsonResponse({"ERROR": "No user with this Id"}, status=503)

    # update username
    if request.method == "PUT":
        try:
            data = JSONParser().parse(request)
        except:
            data = JSONParser().parse(request.body)

        # get user and update
        user = SarvoUser.objects.filter(pk=user_id)[0]
        res = []

        image = Image.open(BytesIO(base64.b64decode(data["profilePictureBase64"])))
        image_resized = resizeimage.resize_cover (image, [512, 512])
        image_tiny = resizeimage.resize_cover (image, [64, 64])

        if "username" in data:
            user.name = data["username"]
            res += ["username"]
        if "profilePictureBase64" in data:
            user.profilePictureBase64 = image_resized
            res += ["profilePictureBase64"]
        if "profilePicturePreviewBase64" in data:
            user.profilePicturePreviewBase64 = image_tiny
            res += ["profilePicturePreviewBase64"]

        try:
            user.save()
        except:
            JsonResponse({"Error": "Update failed"}, status=400)

        return JsonResponse({"updated":str(res)}, status=200)

@access_validation
@message_defaults
def register(request):
    ''' Creates a user
        http --json GET "http://127.0.0.1:8000/auth/register/?username=hans&password=blub&mail=karl@edward.com"

        Additional: If a user is already existent but lands at the signup page -> he gets another verification code here
    '''

    # Parameterdetails - http --json GET "http://127.0.0.1:8000/events/1/?meinParam1=bla&meinParam2=blub&meinParam2=blub"
    # NOTE: ?meinParam1=bla&meinParam2=blub is optional!
    try:
        parameter = eval(request.body)
    except:
        try:
            parameter = eval(eval(str(request.body).replace(":true", ":True").replace(":false", ":False")))
        except:
            return JsonResponse({"message": "Invalid Body"}, status=401)


    # ---------------------------------------------------------------
    #   TODO: users that are already registered need to be added
    #         -> need to have identical user ids User and SarvoUser
    # ---------------------------------------------------------------

    phonenumber=parameter["phonenumber"]
    pw = str(User.objects.make_random_password())+str(User.objects.make_random_password())+str(User.objects.make_random_password())+str(User.objects.make_random_password())+str(User.objects.make_random_password())

    # CHECK IF USER EXISTS ALREADY ELSE REREGISTER
    found = User.objects.filter(username=phonenumber)
    if found: # User exists already -> change password and send new pw
        user = found[0]
        user.password = make_password(pw)

    else:
        user = User.objects.create_user(phonenumber, password=pw)

        # store created date as well
        parameter["createdProfileDate"] = strftime("%Y-%m-%dT%H:%M:%SZ", gmtime())
        parameter["role"] = "user"


    if "username" in parameter:
        user.name = parameter["username"]
    if "profilePictureBase64" in parameter:
        user.profilePictureBase64 = parameter["profilePictureBase64"]
    if "profilePicturePreviewBase64" in parameter:
        user.profilePicturePreviewBase64 = parameter["profilePicturePreviewBase64"]

    user.save() #stores to db

    try:
        su = SarvoUser.objects.get(phonenumber=phonenumber)
        if su:
            # sarvouser is already found, link him to authentication user
            su.authenticationUser = user
            su.isRegistered = True
            su.id = user.id # authentication and sarvo id should be same
            su.save()
    except:
        print("number is not previously known, creating him...")

        su = SarvoUser(name=parameter["username"], phonenumber=user.username, isRegistered=True,
                       authenticationUser=user)
        su.id = user.id
        su.save()

    # return user id
    return JsonResponse({"user_id": user.id, "secret": pw}, status=200)


@access_validation
@message_defaults
def verify(request, phonenumber):
    ''' Creates a user
        http --json GET "http://127.0.0.1:8000/auth/register/?username=hans&password=blub&mail=karl@edward.com"
    '''

    # Parameterdetails - http --json GET "http://127.0.0.1:8000/events/1/?meinParam1=bla&meinParam2=blub&meinParam2=blub"
    # NOTE: ?meinParam1=bla&meinParam2=blub is optional!
    real_number = phonenumber.split(";;;;")[0]
    phonenumber = phonenumber.split(";;;;")[1]

    sms = SMS() # TODO: Move outside, so object is not allocated every time
    verification_code = sms.gen_verfication_code()

    # whitelist for app store
    if real_number == "+4900000000000":
        verification_code = "000000"

    print("sending SMS holding code {} to {}...".format(verification_code, phonenumber))

    sms.send_verification(real_number, verification_code=verification_code)

    # return user id
    return JsonResponse({"verification": verification_code}, status=200)

@login_required_any_views
@access_validation
def logout_call(request):
    try:
        request.user.auth_token.delete()
    except (AttributeError, ObjectDoesNotExist):
        pass

    logout(request)
    return JsonResponse({"message": "LOGOUT SUCCESSFUL"}, status=200)



@message_defaults
@access_validation
def login_call(request):
    ''' Creates a user

        http --json GET "http://127.0.0.1:8000/auth/login/?username=hans&password=blub"
        http --json POST http://127.0.0.1:8000/auth/login/ username="admin" password="sarvosarvo"
        http --json POST http://127.0.0.1:8000/auth/login/ username="sarvo" password="adminadmin"
    '''
    from django.contrib.auth import authenticate, login
    from rest_framework.authtoken.models import Token



    # Parameterdetails - http --json GET "http://127.0.0.1:8000/auth/login/1/?meinParam1=bla&meinParam2=blub&meinParam2=blub"
    # NOTE: ?meinParam1=bla&meinParam2=blub is optional!
    try:
        parameter = eval(request.body)
        username = parameter["username"]
        password = parameter["secret"]
    except:
        return JsonResponse({"message": "MISSING CREDENTIALS username or secret"}, status=401)

    curUser = SarvoUser.objects.filter(phonenumber=username)

    if len(curUser) == 0:
        try:
            user = authenticate(request, username=username, password=password)
            user.delete()
        except:
            print("After delete")
        return JsonResponse({"error": "INVALID CREDENTIALS"}, status=401)


    user = authenticate(request, username=username, password=password)

    if user is not None:
        if user.is_active:
            request.session.set_expiry(860400)  # sets the exp. value of the session
            login(request, user)# the user is now logged in

            # set user id to request 01805123456, pw: sarvosarvo
            curUser = SarvoUser.objects.filter(phonenumber=username)

            if not curUser:
                print("NO User with Phonenumber %s "% str(username))
                # creating him
                try:
                    curUser = SarvoUser.objects.create(phonenumber=username)
                except:
                    print("Creation failed - no login")
                    return JsonResponse({"error": "INVALID CREDENTIALS"}, status=401)
                curUser.save()
            else:
                curUser = curUser[0]
                request.session["userId"] = curUser.id

            da_user = User.objects.get(username=username)
            token = Token.objects.get_or_create(user=da_user)
            try:
                key = token[0].key
            except:
                key = token.key

            return JsonResponse({"message": "LOGIN SUCCESSFUL", "session_id": request.session.session_key, "token":key}, status=200)
    else:
        # Return an 'invalid login' error message.
        return JsonResponse({"error": "INVALID CREDENTIALS"}, status=401)

    return JsonResponse({"ERROR": "Bad request"}, status=400)



@message_defaults
@access_validation
def gdpr_consent(request):
    message = GdprAndUserConsent().get_message()

    return JsonResponse(message, status=200)

@message_defaults
@access_validation
def gdpr_consent_version_only(request):
    message = GdprAndUserConsent().get_message_version()

    return JsonResponse(message, status=200)


