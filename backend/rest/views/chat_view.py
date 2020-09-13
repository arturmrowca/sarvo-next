from django.http import JsonResponse
from rest_framework.parsers import JSONParser

from rest.models import SarvoEventChat, EventChatMessage
from rest.serializer import EventChatMessageSerializer

from rest.views.access_validation._access_validation import access_validation
from rest.views._decorators import login_required_any_views
from rest.views.common import DefaultSender

@login_required_any_views
@access_validation
def chatMessagesByIdPost(request, objId):
    # Post chat messages to the event
    if request.method == 'POST':
        try:data = JSONParser().parse(request)
        except:return JsonResponse({"ERROR": "Bad request"}, status=400)

        chat = SarvoEventChat.objects.filter(pk=objId)
        if not chat: return JsonResponse({"ERROR": "Bad request"}, status=400)
        chat = chat[0]

        # STORE CHAT MESSAGES
        if isinstance(data, list):
            for d in data:d["eventChat"] = chat.id
        else:
            data["eventChat"] = chat.id
            data = [data]
        resp = DefaultSender(EventChatMessage, EventChatMessageSerializer).post_request_data_list(data)




        return resp

    return JsonResponse({"ERROR": "Bad request"}, status=400)

@login_required_any_views
@access_validation
def messages_list(request):
    sen = DefaultSender(EventChatMessage, EventChatMessageSerializer)

    # get all users in list
    resp = sen.get_request_list_given_ids(request)
    return resp


# @access_validation
# @login_required_any_views
# def chatMessagesById(request, objId):
#     # GET: Chat Messages
#     if request.method == 'GET':
#         chat = SarvoEventChat.objects.filter(pk=objId)
#         if not chat:return JsonResponse({"ERROR": "Bad request"}, status=400)
#         chat = chat[0]
#
#         # filter message ids
#         fields = ('id')
#         obj_list = EventChatMessage.objects.filter(eventChat__id__exact=chat.id).values(fields)
#
#         data = {"ids": [l["id"]for l in list(obj_list)]}
#         return JsonResponse(data, safe=False)
