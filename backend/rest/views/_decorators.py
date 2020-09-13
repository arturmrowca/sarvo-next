import traceback
import hashlib
import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser

from rest.models_cache import SessionCacheModel
from rest.serializer_cache import SessionCacheSerializer
from rest.views.common import DefaultSender


def addJsonHeader(response):
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = 'POST, GET, OPTIONS, PUT, DELETE'
    response["Access-Control-Max-Age"] = "1000"
    response["Access-Control-Allow-Headers"] = "Access-Control-Allow-Methods, Authorization, X-Requested-With, Content-Type, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Credentials"
    return response

def _respond_from_session_cache(request):

    cached_get = False
    if "checkChange" in request.GET:
        mode = request.GET["checkChange"]
        if mode == "full":
            try:
                session_id = request.META["HTTP_AUTHORIZATION"].replace("Token ", "")
                url = "/".join(request.build_absolute_uri().split("/")[:-1])
                cached = SessionCacheModel.objects.filter(session_id=session_id, url=url)
                content = eval(cached[0].json_content)
                prevData = json.loads(content)
                # todo: CURRENTLY lists are not supported for hashing (only if body is dict)
                if not isinstance(prevData, list):
                    prevData["md5Hash"] = cached[0].body_hash
                result = JsonResponse(prevData, status=cached[0].status_code, safe=False)

                for c in cached:
                    c.delete()
                print("Responding from Cache")
                return True, addJsonHeader(result)
            except:
                cached_get = False
    return False, None

def _hash_request(request, result):
    # Here preflight to validate if result identical
    # 1) only get request
    # 2) execute function -> remember hash and result and wait s
    if request.method == "GET":

        if "checkChange" in request.GET:
            mode = request.GET["checkChange"]

            # send only hash of this request
            if mode == "hash":

                body = result.content
                bodyHash = hashlib.md5(body).hexdigest()
                newResponse = dict()
                newResponse["md5Hash"] = bodyHash
                result = JsonResponse(newResponse, status=200, safe=False)

                # store it to session hash
                cache = dict()
                cache["url"] = "/".join(request.build_absolute_uri().split("/")[:-1])
                cache["user_id"] = request.auth.user_id # Auth User!
                cache["session_id"] = request.auth.key
                from time import gmtime, strftime # "2018-03-31T15:05:34.121314Z",
                cache["created"] = strftime("%Y-%m-%dT%H:%M:%SZ", gmtime())
                cache["json_content"] = str(body)
                cache["status_code"] = result.status_code
                cache["body_hash"] = bodyHash
                _ = DefaultSender(SessionCacheModel, SessionCacheSerializer).post_request_data(cache)
                return True, addJsonHeader(result)
    return False, None

def _actual_message_defaults(request_func, login_req, allow_list,  request, **kwargs):

    # PREFLIGHT
    error_message = ""
    if request.method == "OPTIONS":return addJsonHeader(JsonResponse({"check": ""}, status=200))

    # ANSWER FROM CACHE
    cached_get, cached_response = _respond_from_session_cache(request)
    if cached_get:return cached_response

    # FUNCTION TO WRAP
    @api_view(allow_list)
    def wrap(request, **kwargs):
        return request_func(request, **kwargs)

    # REQUEST PRINT
    print("\n\n---Incoming Request:")
    try:
        data = eval(eval(str(request.body).replace(":true", ":True").replace(":false", ":False")))
        check_base64 = any([True for item in data.keys() if "base64" in item.lower()])
        if not check_base64:
            print(request.body)
    except:
        pass

    try:
        # PERFORM MODEL ACCESS
        if login_req:
            result = wrap(request, **kwargs)
        else:
            result = request_func(request, **kwargs)
        if not isinstance(result, JsonResponse):
            try:
                result = addJsonHeader(JsonResponse(result, status=200, safe=False))
            except:
                raise ArithmeticError("Tried to send %s - request %s" % (str(result), str(request.body)))


        # HASH REQUEST TO STORE FOR LATER
        hash_send, hash_response = _hash_request(request, result)
        if hash_send:return hash_response

        # PRINT RESPONSE
        try:print("Responding with %s and body: %s" % (str(result)[:100], str(result._container[0])[:100]))
        except:print("Responding with %s" % str(result)[:100])
        return addJsonHeader(result)

    except:
        error_message += "\nFailed"
        traceback.print_exc()
        return addJsonHeader(JsonResponse({"ERROR": error_message}, status=400))

def message_defaults(request_func):
    # no login required
    @csrf_exempt
    def wrapper(request, **kwargs):
        login_req = False
        allow_list = []
        return _actual_message_defaults(request_func, login_req, allow_list, request, **kwargs)
    return wrapper

def login_required_any_views(request_func):
    # login and allows basic views
    @csrf_exempt
    def wrapper(request, **kwargs):
        login_req = True
        allow_list = ["GET", "POST", "DELETE", "PUT", "CREATE"]
        return _actual_message_defaults(request_func, login_req, allow_list, request, **kwargs)
    return wrapper
