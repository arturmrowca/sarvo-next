import traceback

from django.http import JsonResponse, HttpResponse
from rest_framework.parsers import JSONParser
from engine.tools.converter import ImageConverter
from rest.models import SarvoEvent, SarvoUser, SarvoGroup, Contacts, Device, EventChatMessage, DateOption, BrowseEvent
from rest.serializer import UserSerializer, ContactsSerializer, BrowseEventSerializer
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

@login_required_any_views
@access_validation
def allBrowseEventsByCategory(request):
    # input category
    try:
        data = JSONParser().parse(request)
    except:
        return JsonResponse({"ERROR": "Bad request"}, status=400)

    category = data["category"]
    idxFrom = data["from"]
    idxTo = data["to"]

    # input: from: index to index:
    objs = BrowseEvent.objects.filter(categoryTitle= category)
    ser = BrowseEventSerializer(objs, many=True)

    # return indices from to
    return JsonResponse(ser.data[idxFrom:idxTo], safe=False, status=200)

@login_required_any_views
@access_validation
def availableCategories(request):

    categories = [c["categoryTitle"] for c in BrowseEvent.objects.order_by().values('categoryTitle').distinct()]

    return JsonResponse({"categories": categories}, status=200)