import traceback

from django.http import JsonResponse
from rest_framework.parsers import JSONParser

from engine.tools.converter import ImageConverter
from engine.transmission.push_notification_singleton import PNSingleton
from rest.models import SarvoEvent, DateOption, SarvoEventChat, EventChatMessage, SarvoUser, SarvoGroup
from rest.serializer import EventSerializer, DateOptionSerializer, EventChatProtoSerializer, EventChatMessageSerializer
from rest.views.access_validation._access_validation import access_validation

from rest.views._decorators import login_required_any_views
from rest.views.common import DefaultSender
from rest.views.user_view import extract_user_id


@login_required_any_views
@access_validation
def event(request):
    if request.method == 'POST':
        # post an event with dateoptions etc.
        # read all
        try:
            data = JSONParser().parse(request)
        except:
            return JsonResponse({"ERROR": "Bad request"}, status=400)

        if not data["fixed_date"]:
            data["fixed_date"] = "1111-11-11T11:11:11.111Z"

        # IF FROM TEMPLATE - prepare Description - remove images!
        if "from_template" in data:
            def filterTags(txt):
                import re
                """ Filter < and >tags"""
                cleantext = txt
                cleanr = re.compile('<img.*?>')
                cleantext = re.sub(cleanr, '', cleantext)

                return cleantext

            data["description"] = filterTags(data["description"])

        # compress and store preview image
        try:
            data["imageBase64"], data["imagePreviewBase64"] = ImageConverter().stdBaseAndPreview(
                data["imageBase64"])
        except:
            print("resize failed, with error: ")
            traceback.print_exc()

        # extract date options
        try:
            date_options = data.pop('possible_dates')
        except:
            return JsonResponse({"ERROR": "Missing field possible_dates"}, status=400)
        try:
            d = eval(date_options.replace("\t", "").replace("\n", "").replace(" ", ""))
        except:
            d = date_options
        date_options = d

        # FIRST store event
        sen = DefaultSender(SarvoEvent, EventSerializer)  # serializer for getting
        data["organization_status"] = str(data["organization_status"])
        response, eventSerializer = sen.post_request_data(data)
        if eventSerializer is None: return response

        # SECOND STORE DATEOPTIONS + IF FIXED SET FIXED
        for d in date_options:
            d["event"] = eventSerializer.data["id"]
        sends = DefaultSender(DateOption, DateOptionSerializer)
        resp = sends.post_request_data_list(date_options, {"id": eventSerializer.data["id"]})
        if eval(eventSerializer.data["organization_status"])["DATE"] == "fixed":
            date_id = eval(resp.content)["ids"][0]
            eventSerializer.instance.fixed_date_option_id = date_id
            eventSerializer.instance.fixed_date = sends.serializer.instance.date
            eventSerializer.instance.save()

        # THIRD CHAT
        chat_data = dict(event=eventSerializer.data["id"])
        _ = DefaultSender(SarvoEventChat, EventChatProtoSerializer).post_request_data(chat_data)

        # FOURTH send push to participants
        if "invite_users" in data and data["invite_users"]:
            organizer = SarvoUser.objects.get(pk=data["organizer"])

            push = PNSingleton().invitationPush(data["name"], organizer.name)
            push.additional["event_id"] = eventSerializer.data["id"]
            push.post_notification(data["participants"])

        return resp
    if request.method == 'GET':
        return JsonResponse({"ERROR": "Not Implemented"}, status=400)


@login_required_any_views
@access_validation
def event_image_preview(request, eventId):
    # 1. load corresponding object
    try:
        obj = SarvoEvent.objects.get(pk=eventId)  # pk sind parameter
    except SarvoEvent.DoesNotExist:
        return JsonResponse({"imagePreviewBase64": ""}, status=200)

    return JsonResponse({"imagePreviewBase64": obj.imagePreviewBase64}, status=200)



@login_required_any_views
@access_validation
def event_image_full(request, eventId):
    # 1. load corresponding object
    try:
        obj = SarvoEvent.objects.get(pk=eventId)  # pk sind parameter
    except SarvoEvent.DoesNotExist:
        return None

    return JsonResponse({"imageBase64": obj.imageBase64}, status=200)


@login_required_any_views
@access_validation
def event_detail_invite(request, eventId):
    # 1. check whats to upsert
    try:
        data = JSONParser().parse(request)
    except:
        data = JSONParser().parse(request.body)

    # 2. load corresponding object
    try:
        obj = SarvoEvent.objects.get(pk=eventId)  # pk sind parameter
    except SarvoEvent.DoesNotExist:
        return None

    all_participants = obj.participants.all()

    new_participants = [int(x) for x in data["new_participants"]]
    new_participant_objs = SarvoUser.objects.filter(id__in=new_participants)
    for participant in new_participant_objs:
        if not participant in all_participants:
            obj.participants.add(participant)
    obj.save()

    return JsonResponse({"participants": [x.id for x in obj.participants.all()]}, status=200)


@login_required_any_views
@access_validation
def chatMessagesById(request, eventId):
    """
    Get all message ids for a given chat. This may be helpfull for pagination. Imagine
    a event with couple of Thousand messages, than querying all would be to time
    consuming

    :param request: the request holding header, etc. (everything from django)
    :param eventId: the event id
    :return:
    """

    # GET: Chat Messages
    if request.method == 'GET':
        # get the the corresponding chat id for the event

        chat = SarvoEventChat.objects.filter(event_id=eventId)
        if not chat: return JsonResponse({"ERROR": "Bad request"}, status=400)
        chatId = chat[0].id

        # filter message ids
        fields = ('id')
        obj_list = EventChatMessage.objects.filter(eventChat__id__exact=chatId).values(fields)

        data = {"ids": [l["id"] for l in list(obj_list)]}
        return JsonResponse(data, safe=False)


@login_required_any_views
@access_validation
def eventchat(request, objId):
    # Post chat message to the event
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
        except:
            return JsonResponse({"ERROR": "Bad request"}, status=400)

        # GET CHAT
        chat = SarvoEventChat.objects.filter(event_id=objId)
        if not chat: return JsonResponse({"ERROR": "Bad request"}, status=400)
        chat = chat[0]

        # STORE CHAT MESSAGES OR ONE MEssage
        if isinstance(data, list):
            for d in data: d["eventChat"] = chat.id
        else:
            data["eventChat"] = chat.id
            data = [data]
        resp = DefaultSender(EventChatMessage, EventChatMessageSerializer).post_request_data_list(data)

        return resp

    # GET: Chat Messages
    if request.method == 'GET':
        chat = SarvoEventChat.objects.filter(event_id=objId)
        if not chat: return JsonResponse({"ERROR": "Bad request"}, status=400)
        chat_id = chat[0].id

        sen = DefaultSender(EventChatMessage, EventChatMessageSerializer)

        # Get details list
        obj_list, request, parameter = sen.defaultDetailReceiveForeignKey(request,
                                                                          foreign_id=chat_id,
                                                                          foreign_id_name="eventChat")

        # Return only last n entries
        n = 9
        obj_list = obj_list.order_by('-sentTime')[:n]
        obj_list = reversed(obj_list)
        serializer = EventChatMessageSerializer(obj_list, many=True)

        # append user ids
        relList = set([idds["sender"] for idds in serializer.data])
        userMap = dict([(u.id, u.name) for u in SarvoUser.objects.filter(pk__in=relList)])

        for i in range(len(serializer.data)): # if same name use numbers
            if serializer.data[i]["sender"] in userMap:
                serializer.data[i]["senderName"] = userMap[serializer.data[i]["sender"]]
            else:
                serializer.data[i]["senderName"] = "Unknown"

        # Serialize and send
        return JsonResponse(serializer.data, safe=False)



@login_required_any_views
@access_validation
def eventchatSubset(request, objId, minId, numberElemens):
    """
    Returns numberElemens entries from minId and lower

    if numberElemens is 0 -> return all NEW Ids -
    :param request:
    :param objId:
    :param minId:
    :param numberElemens:
    :return:
    """
    # Post chat message to the event
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
        except:
            return JsonResponse({"ERROR": "Bad request"}, status=400)

        # GET CHAT
        chat = SarvoEventChat.objects.filter(event_id=objId)
        if not chat: return JsonResponse({"ERROR": "Bad request"}, status=400)
        chat = chat[0]

        # STORE CHAT MESSAGES OR ONE MEssage
        if isinstance(data, list):
            for d in data: d["eventChat"] = chat.id
        else:
            data["eventChat"] = chat.id
            data = [data]
        resp = DefaultSender(EventChatMessage, EventChatMessageSerializer).post_request_data_list(data)

        return resp

    # GET: Chat Messages
    if request.method == 'GET':
        chat = SarvoEventChat.objects.filter(event_id=objId)
        if not chat: return JsonResponse({"ERROR": "Bad request"}, status=400)
        chat_id = chat[0].id

        sen = DefaultSender(EventChatMessage, EventChatMessageSerializer)

        # Get details list
        minId = int(minId)
        obj_list, request, parameter = sen.defaultDetailReceiveForeignKey(request,
                                                                          foreign_id=chat_id,
                                                                          foreign_id_name="eventChat")

        if str(numberElemens) != "0": # return old elements
            # smaller than min
            obj_list = obj_list.filter(id__lt=minId)

            # Return only last n entries
            n = int(numberElemens)
            obj_list = obj_list.order_by('-sentTime')[:n]
            obj_list = reversed(obj_list)
        else:
            # return all newest entries
            obj_list = obj_list.filter(id__gt=minId) # only ids greater than this


        # Serialize and send
        serializer = EventChatMessageSerializer(obj_list, many=True)

        # append user ids
        relList = set([idds["sender"] for idds in serializer.data])
        userMap = dict([(u.id, u.name) for u in SarvoUser.objects.filter(pk__in=relList)])

        for i in range(len(serializer.data)):  # if same name use numbers
            if serializer.data[i]["sender"] in userMap:
                serializer.data[i]["senderName"] = userMap[serializer.data[i]["sender"]]
            else:
                serializer.data[i]["senderName"] = "Unknown"

        return JsonResponse(serializer.data, safe=False)


@login_required_any_views
@access_validation
def eventchatSingle(request, objId):
    # Post chat message to the event
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
        except:
            return JsonResponse({"ERROR": "Bad request"}, status=400)

        # GET CHAT
        chat = SarvoEventChat.objects.filter(event_id=objId)
        if not chat: return JsonResponse({"ERROR": "Bad request"}, status=400)
        chat = chat[0]

        # STORE CHAT MESSAGES OR ONE MEssage
        if isinstance(data, list):
            for d in data: d["eventChat"] = chat.id
        else:
            data["eventChat"] = chat.id
            data = [data]
        resp = DefaultSender(EventChatMessage, EventChatMessageSerializer).post_request_data_list(data)

        # Send push notification
        try:
            sender = SarvoUser.objects.get(pk=int(data[0]["sender"]))
            event = SarvoEvent.objects.get(pk=objId)
            receivers = [e.id for e in event.participants.all()]
            if sender.id in receivers:
                receivers.remove(sender.id)
            txt = "%s: %s" % (str(sender.name), str(data[0]["text"]))
            push = PNSingleton().chatPush(event.name, txt)
            push.additional["event_id"] = objId
            push.post_notification(receivers)
        except:
            traceback.print_exc()
            print("Could not push chat message")

        return resp


@login_required_any_views
@access_validation
def event_detail_dateoption_modify(request, eventId, dateOptionId):
    # POST: Add accept, decline unsure to dateoption
    if request.method == 'POST':
        userId = extract_user_id(request)
        if userId is None: return JsonResponse({"ERROR": "Unknown user"}, status=400)

        try:
            data = JSONParser().parse(request)
        except:
            return JsonResponse({"ERROR": "Bad request"}, status=400)

        dateOption = DateOption.objects.get(pk=int(dateOptionId))
        user = SarvoUser.objects.get(pk=userId)

        # user clicked accept
        if data["mode"] == "accept":
            # check if he already is in accepting set
            resSet = dateOption.acc_participants.filter(id=userId)
            if len(resSet) == 0:
                # add him to result set if not
                dateOption.acc_participants.add(user)

                # remove him from declining and unsure set
                dateOption.dec_participants.remove(user)
                dateOption.inter_participants.remove(user)
                dateOption.save()

        # user clicked decline
        if data["mode"] == "decline":
            # check if he already is in accepting set
            resSet = dateOption.dec_participants.filter(id=userId)
            if len(resSet) == 0:
                # add him to result set if not
                dateOption.dec_participants.add(user)

                # remove him from declining and unsure set
                dateOption.acc_participants.remove(user)
                dateOption.inter_participants.remove(user)
                dateOption.save()

        # user clicked decline
        if data["mode"] == "unsure":
            # check if he already is in accepting set
            resSet = dateOption.inter_participants.filter(id=userId)
            if len(resSet) == 0:
                # add him to result set if not
                dateOption.inter_participants.add(user)

                # remove him from declining and unsure set
                dateOption.acc_participants.remove(user)
                dateOption.dec_participants.remove(user)
                dateOption.save()

        return JsonResponse(
            {"nrIn": len(dateOption.acc_participants.all()), "nrOut": len(dateOption.dec_participants.all()),
             "nrUnsure": len(dateOption.inter_participants.all())}, status=200)


@login_required_any_views
@access_validation
def event_detail_dateoption(request, objId):
    # POST: Add List of DateOptions to event with objID
    if request.method == 'POST':

        try:
            data = JSONParser().parse(request)
        except:
            return JsonResponse({"ERROR": "Bad request"}, status=400)
        if isinstance(data, list):
            for d in data: d["event"] = objId
        else:
            data["event"] = objId
            data = [data]
        return DefaultSender(DateOption, DateOptionSerializer).post_request_data_list(data, {"id": objId})

    # GET: Get list of dateoptions for this event
    if request.method == 'GET':
        sen = DefaultSender(DateOption, DateOptionSerializer)
        # Get details list
        obj_list, request, parameter = sen.defaultDetailReceiveForeignKey(request, foreign_id=objId,
                                                                          foreign_id_name="event")

        # Serialize and send
        serializer = DateOptionSerializer(obj_list, many=True)
        return JsonResponse(serializer.data, safe=False)


@login_required_any_views
@access_validation
def event_detail(request, objId):
    if request.method == 'GET':
        # 1. Get corresponding Dateoptions
        sen = DefaultSender(DateOption, DateOptionSerializer)
        obj_list, request, parameter = sen.defaultDetailReceiveForeignKey(request, foreign_id=objId,
                                                                          foreign_id_name="event")
        serializer = DateOptionSerializer(obj_list, many=True)
        dateOptionEntry = {"possible_dates": serializer.data}

        # Filter for requests

        obj = SarvoEvent.objects.get(pk=objId)

        serializer = EventSerializer(obj)

        # targetGroups
        groups = SarvoGroup.objects.filter(events=obj.id)  # relevant groups
        targetGroups = {"targetGroups": [g.id for g in groups]}

        # do not waste space -> loaded separately
        serializer.data["imageBase64"] = ""
        return JsonResponse({**serializer.data, **dateOptionEntry, **targetGroups}, safe=False)

    if request.method == 'POST':
        # upsert event details -> usually a put!
        # whats in the body is overwritten

        # 1. check whats to upsert
        try:
            data = JSONParser().parse(request)
        except:
            data = JSONParser().parse(request.body)

        # 2. load corresponding object
        try:
            obj = SarvoEvent.objects.get(pk=objId)  # pk sind parameter
        except SarvoEvent.DoesNotExist:
            return None



        # compress and store preview image
        try:
            if "imageBase64" in data:
                data["imageBase64"], data["imagePreviewBase64"] = ImageConverter().stdBaseAndPreview(
                    data["imageBase64"])
        except:
            print("resize failed, with error: ")
            traceback.print_exc()

        # 3. store if it works
        ok = []
        for param in data:

            # UPSERT TARGET GROUPS
            if param == "targetGroups":
                # Remove all groups from this event
                for g in SarvoGroup.objects.filter(events=objId):
                    g.events.remove(obj)
                    g.save()
                groups = SarvoGroup.objects.filter(id__in=data[param])  # relevant groups

                # Add all groups that are set in passed argument
                for group in groups:  # assign event to group
                    eventIds = list([e.id for e in group.events.all()])
                    group.events.clear()  # update
                    for eventId in set(list(eventIds) + [obj.id]):
                        group.events.add(SarvoEvent.objects.get(pk=eventId))
                    group.save()
                ok += [param]
                continue

            # UPSERT PARTICIPANTS
            if param == "participants":
                prev_participants = [v.id for v in obj.participants.all()]
                new_members = set(data[param]).difference(prev_participants)
                deleted_members = set(prev_participants).difference(data[param])

                # add new members
                new_members_objects = SarvoUser.objects.filter(id__in=new_members)
                for memberObject in new_members_objects:
                    obj.participants.add(memberObject)

                # send push to new members
                push = PNSingleton().invitationPush(obj.name, obj.organizer.name)
                push.additional["event_id"] = obj.id
                push.post_notification(new_members)

                # delete removed members
                del_members_objects = SarvoUser.objects.filter(id__in=deleted_members)
                for memberObject in del_members_objects:
                    obj.participants.remove(memberObject)


            # UPSERT FIXED DATE
            if param == "fixedDateOnly":
                obj.fixed_date = data["fixedDateOnly"]
                ok += [param]

            # if fixed parameter -> set the fixed dateoption id as well!
            if param == "fixed_date":
                # Get dateoptions list
                if not data["fixed_date"] == "reset":
                    do = DateOption.objects.filter(date=data["fixed_date"])[0]
                    obj.fixed_date_option_id = do.id
                    obj.fixed_date = data["fixed_date"]
                else:  # reset fixed value -> unfix pressed
                    obj.fixed_date_option_id = -1
                ok += ["fixed_date_option_id"]
                continue

            # UPSERT ORGANIZATION STATUS
            try:
                if param == "organization_status":
                    data[param] = str(data[param])
                    exec("obj." + param + " = str(data[param])")

                # UPDATE OTHER PARAMS
                if isinstance(data[param], str) or isinstance(data[param], bytes):
                    if param != "organization_status":
                        data[param] = data[param]
                        exec("obj." + param + " = data[param]")
                ok += [param]
            except:
                traceback.print_exc()

        obj.save()
        return JsonResponse({"Valid and Set": str(ok)}, status=200)

    if request.method == "DELETE":
        return DefaultSender(SarvoEvent, EventSerializer).defaultDelete(objId)


@login_required_any_views
@access_validation
def dateoption_detail(request, objId):
    if request.method == "DELETE":
        return DefaultSender(DateOption, DateOptionSerializer).defaultDelete(objId)

    if request.method == "GET":
        dateoption = DateOption.objects.get(pk=objId)

        data = dict()
        data["acc_participants"] = [d.name for d in dateoption.acc_participants.all()]
        data["inter_participants"] = [d.name for d in dateoption.inter_participants.all()]
        data["dec_participants"] = [d.name for d in dateoption.dec_participants.all()]

        return JsonResponse(data, status=200)

    if request.method == "POST":

        # extract data
        try:
            data = JSONParser().parse(request)
        except:
            data = JSONParser().parse(request.body)

        # get relevant
        obj = DateOption.objects.get(pk=objId)
        ok = []

        # set properties
        for param in data:
            try:
                data[param] = data[param]
                exec("obj." + param + " = data[param]")
                ok += [param]
            except:
                traceback.print_exc()

        # save
        obj.save()
        return JsonResponse({"Valid and Set": str(ok)}, status=200)
