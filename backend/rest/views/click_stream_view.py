from django.http import JsonResponse
from rest_framework.parsers import JSONParser
from rest.models import SarvoUser
from rest.models_stream import UserClickStreamModel, BasicFeedbackFormModel

from rest.serializer_stream import UserClickStreamSerializer, BasicFeedbackFormSerializer
from rest.views.access_validation._access_validation import access_validation
from rest.views._decorators import message_defaults
from rest.views.common import DefaultSender


def extract_user_id(request):
    try:
        phone_nr = request.user.username
        user = SarvoUser.objects.filter(phonenumber__exact=phone_nr)[0]
        return user.id
    except:
        return None

@message_defaults
@access_validation
def push_clickstream(request, lastN = None):
    # lastN -> number of entries to return

    # get SarvoUser Id by phonenumber -- DISABLED FOR TESTING
    #user_id = extract_user_id(request)
    #if user_id is None:
    #    return JsonResponse({"ERROR": "User id not set"}, status=503)

    # Store entry
    if request.method == "POST":
        try:
            data = JSONParser().parse(request)
        except:
            return JsonResponse({"ERROR": "Bad request"}, status=400)

        resp, _ = DefaultSender(UserClickStreamModel, UserClickStreamSerializer).post_request_data(data)
        return resp
    if request.method == "GET":
        if not lastN is None:
            return DefaultSender(UserClickStreamModel, UserClickStreamSerializer).get_request(request, lastN)
        else:
            return DefaultSender(UserClickStreamModel, UserClickStreamSerializer).get_request(request)

    print("not implemented")

#@login_required_any_views
@message_defaults
def feedback_form(request):
    if request.method == "POST":
        try:
            data = JSONParser().parse(request)
        except:
            return JsonResponse({"ERROR": "Bad request"}, status=400)

        resp, _ = DefaultSender(BasicFeedbackFormModel, BasicFeedbackFormSerializer).post_request_data(data)
        return resp