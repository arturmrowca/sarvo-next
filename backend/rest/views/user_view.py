import traceback

from django.http import JsonResponse, HttpResponse
from rest_framework.parsers import JSONParser
from engine.tools.converter import ImageConverter
from rest.models import SarvoEvent, SarvoUser, SarvoGroup, Contacts, Device, EventChatMessage, DateOption
from rest.serializer import UserSerializer, ContactsSerializer
from rest.views.access_validation._access_validation import access_validation
from rest.views._decorators import message_defaults, login_required_any_views
from rest.views.common import DefaultSender


def extract_user_id(request):
    try:
        phone_nr = request.user.username
        user = SarvoUser.objects.filter(phonenumber__exact=phone_nr)[0]
        return user.id
    except:
        return None

''' --------------------------------------------------------------------------------------
    CURRENT USER
    --------------------------------------------------------------------------------------'''
@login_required_any_views
@access_validation
def curuser_id(request):
    # returns Id of current user if he is logged in (i.e. always)
    # else returns User unknown
    # each user has an id loaded on login

    # get SarvoUser Id by phonenumber
    user_id = extract_user_id(request)
    if user_id is None:
        return JsonResponse({"ERROR": "User id not set"}, status=503)
    else:
        dat = {"userId":user_id}
        return JsonResponse(dat, status=200)


@login_required_any_views
@access_validation
def curuser_full(request):

    # User id
    userId = extract_user_id(request)

    # create this user
    if userId is None:
        return JsonResponse({"ERROR": "Unknown user"}, status=400)

    if request.method == "GET":
        # full profile of users
        sen = DefaultSender(SarvoUser, UserSerializer)
        response = sen.defaultDetailReceive(request, userId)
        if isinstance(response, HttpResponse): return JsonResponse({"ERROR": "User not found"}, status=400)
        obj, request, parameter = response

        return sen.defaultDetailPush(obj, request)

    if request.method == "POST":
        obj = SarvoUser.objects.get(pk=userId)
        data = JSONParser().parse(request)
        ok = []

        # resize images
        try:
            if "profilePictureBase64" in data:
                data["profilePictureBase64"], data["profilePicturePreviewBase64"] = ImageConverter().stdBaseAndPreview(
                    data["profilePictureBase64"])
        except:
            print("resize failed, with error: ")
            traceback.print_exc()

        # first set device if that was requested
        if "deviceTokens" in data:
            for i in range(len(data["deviceTokens"])):

                token = data["deviceTokens"][i]
                if "deviceTypes" in data:
                    platform = data["deviceTypes"][i]
                else:
                    platform = "Empty"

                # check if device exists else add it
                devices = Device.objects.filter(token=token)
                if len(devices) == 0:
                    dev = Device.objects.create(sarvoUser=SarvoUser.objects.get(pk=userId))
                    dev.token = token
                    dev.platform = platform
                    dev.save()
                    ok += [dev]
                if len(devices) > 1: # delete redundant
                    for d in devices[1:]:
                        d.delete()


                # also check if it assigned the current user id else change it to this id
                devices = Device.objects.filter(token=token)
                for device in devices:
                    if device.sarvoUser.id != userId or device.sarvoUser_id != userId:
                        # set to current user
                        currentSarvoUser = SarvoUser.objects.get(id=userId)
                        device.sarvoUser = currentSarvoUser
                        device.save()

                            # set all properties that are transmitted as {propertyName:propertyValue}
        for property in data:

            # add tokens to model
            if property in ["deviceTokens", "deviceTypes"]:
                continue
            if property == "username":
                try:
                    exec("obj.%s=data[property]" % str("name"))
                    ok += [property]
                except:
                    pass
                continue

            # set other properties to model
            if property in ["id"]:
                continue
            try:
                exec("obj.%s=data[property]" % str(property))
                ok += [property]
            except:
                pass
        obj.save()
        return JsonResponse({"Upsert Successful": str(ok)}, status=200)

@login_required_any_views
@access_validation
def curuser_events_full(request):

    # receive user id
    userId = extract_user_id(request)
    if userId is None: return JsonResponse({"ERROR": "Unknown user"}, status=400)

    # filter events with this id
    from datetime import datetime, timedelta
    time_threshold = datetime.now() - timedelta(hours=24)
    from django.db.models import Q
    query_objects = SarvoEvent.objects.filter(Q(participants__id__exact=userId, fixed_date__gt=time_threshold) | Q(participants__id__exact=userId, organization_status__icontains='pending'))
    data = list(query_objects.values())


    for (d, qo) in zip(data, query_objects):
        try:
            d["organization_status"] = eval(d["organization_status"])
        except:
            d["organization_status"] = {"DATE": d["organization_status"]}
        try:
            d["message_count"] = len(qo.sarvoeventchat.eventchatmessage_set.all())
        except:
            d["message_count"] = 0
        d["imageBase64"] = ""# do not send full base 64 image

    return JsonResponse(data, safe=False)


@login_required_any_views
@access_validation
def curuser_events(request):

    # receive user id
    userId = extract_user_id(request)
    if userId is None: return JsonResponse({"ERROR": "Unknown user"}, status=400)

    # filter events with this id
    fields = ("id")
    obj_list = SarvoEvent.objects.filter(participants__id__exact=userId).values(fields)
    dat = {"ids": [l["id"] for l in list(obj_list)]}

    # drop images

    return JsonResponse(dat, status=200)

''' --------------------------------------------------------------------------------------
    ANY USER
    --------------------------------------------------------------------------------------'''

@login_required_any_views
@access_validation
def user_full(request, objId):

    # full profile of user
    sen = DefaultSender(SarvoUser, UserSerializer)
    response = sen.defaultDetailReceive(request, objId)
    if isinstance(response, HttpResponse): return JsonResponse({"ERROR": "Bad request"}, status=400)
    obj, request, parameter = response

    # exclude full image
    obj.profilePictureBase64 = "";
    #obj.profilePicturePreviewBase64 = "";

    return sen.defaultDetailPush(obj, request)

@login_required_any_views
@access_validation
def user_full_list(request):
    # objId = eventId
    # full profile of user
    sen = DefaultSender(SarvoUser, UserSerializer)

    # get all users in list
    resp = sen.get_request_list_given_ids(request, objectID=True)
    return resp

@login_required_any_views
@access_validation
def user_preview_list(request):
    # objId = eventId
    # full profile of user
    sen = DefaultSender(SarvoUser, UserSerializer)

    # get all users in list
    resp = sen.get_request_list_given_ids(request, objectID=True, exclude_fields=["profilePictureBase64"])
    return resp

@message_defaults
@access_validation
def user_given_id(request, objId):
    if request.method == "GET":
        return DefaultSender(SarvoUser, UserSerializer).get_request_given_id(request, objId)

    # objId = User id
    if request.method == "DELETE":
        return DefaultSender(SarvoUser, UserSerializer).defaultDelete(objId)

@login_required_any_views
@access_validation
def curuser_groups(request):

    # return group ids of current user
    userId = extract_user_id(request)
    if userId is None: return JsonResponse({"ERROR": "Unknown user"}, status=400)

    if request.method == "GET":
        groups = SarvoGroup.objects.filter(members=userId)
        data = {"group_ids" : [m.id for m in groups]}
        return JsonResponse(data, safe=False)

@login_required_any_views
@access_validation
def curuser_contacts(request):
    userId = extract_user_id(request)
    if userId is None: return JsonResponse({"ERROR": "Unknown user"}, status=400)

    if request.method == "GET":
        contact = Contacts.objects.filter(sarvoUser=userId)[0]
        contact_objects = contact.contacts.all()
        return JsonResponse({"user_ids": [c.id for c in contact_objects]}, status=200)


@login_required_any_views
@access_validation
def curuser_contacts_add_delete(request):
    userId = extract_user_id(request)
    if userId is None: return JsonResponse({"ERROR": "Unknown user"}, status=400)

    if request.method == "POST":
        try:data = JSONParser().parse(request)
        except:return JsonResponse({"ERROR": "Bad request"}, status=400)

        # Contacts existing
        contacts = Contacts.objects.filter(sarvoUser=userId)[0]
        if contacts:
            l = []
            for id in data["user_ids"]:
                try:
                    contacts.contacts.add(id)
                except:
                    l += [id]
            contacts.save()
            return JsonResponse({"message":"Successfully added", "Failed_ids": l}, status=201)

        else:
            dat = dict()
            dat["sarvoUser"] = userId
            dat["contacts"] = data["user_ids"]
            resp, _ = DefaultSender(Contacts, ContactsSerializer).post_request_data(dat)
        return resp


@login_required_any_views
@access_validation
def curuser_contacts_delete(request, contact_id):

    if request.method == "DELETE":
        # Contacts existing+
        print("NOT TESTED")
        contacts = Contacts.objects.filter(sarvoUser=contact_id)[0]
        if contacts:
            contacts.contacts.remove(contact_id)
            contacts.save()
            return JsonResponse({"message": "deleted entry %s" % str(contact_id)}, status=201)


@login_required_any_views
@access_validation
def curuser_contacts_sync(request):
    userId = extract_user_id(request)
    if userId is None: return JsonResponse({"ERROR": "Unknown user"}, status=400)

    if request.method == "POST":
        try:data = JSONParser().parse(request)
        except:return JsonResponse({"ERROR": "Bad request"}, status=400)

        # Get contact list in backend.
        contacts_backend = Contacts.objects.filter(sarvoUser=userId)  # ids
        contacts_backend_ids = contacts_backend.values_list("id")  # ids

        # Clean phone number format: +cccnnnnnnnn where c is country code and n are the digits.
        phone_numbers = []
        l = []
        for num in data['phoneNumbers']:
            phone_numbers += [num]
            """try:
                new_num = ('+' +
                           str(pn.parse(num).country_code) +
                           str(pn.parse(num).national_number))
                phone_numbers += [new_num.replace(" ", "")]
            except:
                if num != None and len(num) > 0 and num[0]==0:
                    # TODO: Country of the current user to be used here as default region!
                    default_region = 'DE'
                    new_num = ('+' +
                               str(pn.parse(num, default_region).country_code) +
                               str(pn.parse(num, default_region).national_number))
                    phone_numbers += [new_num.replace(" ", "")]
                else:
                    l += [num.replace(" ", "")]
        phone_numbers += l####"""

        new_users = SarvoUser.objects.filter(phonenumber__in=phone_numbers)
        new_users_ids = new_users.values_list("id", flat=True)

        # store new list of user ids in db. -> return profilePicturePreviewBase64 and no imagefull!
        if new_users_ids:
            dat = dict()
            dat["sarvoUser"] = userId
            dat["contacts"] = new_users_ids
            resp, _ = DefaultSender(Contacts, ContactsSerializer).post_request_data(dat)

            # get diff of Sarvo users backend vs. frontend and send it to frontend.
            # TODO: Diff to be implemented (in frontend as well).
            uids_4_frontend = [id for id in new_users_ids]# if id not in set(contacts_backend)]
            if uids_4_frontend:
                res = DefaultSender(SarvoUser, UserSerializer).get_request_list_given_id_list(uids_4_frontend, exclude_fields=["profilePictureBase64"])
                return res
            else:
                return JsonResponse({"message": "No contacts to be updated."}, status=204)
        else:
            uids_4_frontend = [id for id in contacts_backend_ids]
            res = DefaultSender(SarvoUser, UserSerializer).get_request_list_given_id_list(uids_4_frontend, exclude_fields=["profilePictureBase64"])

            return res



@login_required_any_views
@access_validation
def curuser_delete_account(request):
    """
    This method deletes the account of the user and all information we have on him
    to be GDPR conform
    :param request:
    :return:
    """
    userId = extract_user_id(request)
    if userId is None: return JsonResponse({"ERROR": "Unknown user"}, status=400)

    # DELETE ALL INFORMATION


    # Device und Token
    devices = Device.objects.filter(sarvoUser_id=userId)
    for f in devices:
        f.delete()#

    # Contacts (mapping - one sid to many sid)
    contacts = Contacts.objects.filter(sarvoUser_id=userId)
    for c in contacts:
        # remove sarvo users
        c.contacts.clear()
        c.delete()

    # SarvoEvent:
    #   delete all chat messages he posted
    msgs = EventChatMessage.objects.filter(sender_id = userId)
    for msg in msgs:
        msg.delete()

    #   delete him as participant
    sarvoUsers = SarvoUser.objects.filter(id=userId)
    for su in sarvoUsers:
        objList = SarvoEvent.objects.filter(participants__id__exact=userId)
        for event in objList:
            event.participants.remove(su)

        #   delete all events he organized
        objList = SarvoEvent.objects.filter(organizer_id=userId)
        for event in objList:
            event.delete()

        # delete him from all DateOptions
        dOptions = DateOption.objects.filter(acc_participants__id__exact=userId)
        for do in dOptions:
            do.acc_participants.remove(su)

        dOptions = DateOption.objects.filter(inter_participants__id__exact=userId)
        for do in dOptions:
            do.inter_participants.remove(su)

        dOptions = DateOption.objects.filter(dec_participants__id__exact=userId)
        for do in dOptions:
            do.dec_participants.remove(su)

        # delete him from all SarvoGroups
        ms = SarvoGroup.objects.filter(members = userId)
        for m in ms:
            m.members.remove(su)
            try:
                m.admins.remove(su)
            except:
                pass

    # SarvoUser
    sarvoUsers = SarvoUser.objects.filter(id=userId)
    for su in sarvoUsers:

        # AuthenticationUser delete
        authUser = su.authenticationUser
        try:
            authUser.delete()
        except:
            print("Already done")

        # Sarvo User Delete
        su.delete()

    print("DELETED ALL ")

    return JsonResponse({"Deletion Successful": "DONE"}, status=200)