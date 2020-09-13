import traceback

from django.http import JsonResponse
from rest_framework.parsers import JSONParser

from engine.tools.converter import ImageConverter
from rest.models import SarvoEvent, SarvoUser, SarvoGroup
from rest.serializer import GroupSerializer, UserSerializer

from rest.views.access_validation._access_validation import access_validation
from rest.views._decorators import login_required_any_views
from rest.views.common import DefaultSender

''' --------------------------------------------------------------------------------------
    Group

    --------------------------------------------------------------------------------------'''

@login_required_any_views
@access_validation
def group(request):
    # post an event with dateoptions etc.
    # read all
    if request.method == "POST":
        try:data = JSONParser().parse(request)
        except:return JsonResponse({"ERROR": "Bad request"}, status=400)
        if isinstance(data["members"], str):
            data["members"] = eval(data["members"])
        if isinstance(data["admins"], str):
            data["admins"] = eval(data["admins"])

        resp, _ = DefaultSender(SarvoGroup, GroupSerializer).post_request_data(data)
        return resp

    return JsonResponse({"ERROR": "Bad request"}, status=400)

@login_required_any_views
@access_validation
def group_detail(request, objId):
    if request.method == "GET":
        sen = DefaultSender(SarvoGroup, GroupSerializer)
        obj, request, parameter = sen.defaultDetailReceive(request, objId)
        return sen.defaultDetailPush(obj, request)

    if request.method == "DELETE":
        instance = SarvoGroup.objects.get(pk=objId)
        instance.delete()
        return JsonResponse({"message": "deleted group %s" % str(objId)}, safe=False)

    # Upsert stuff
    if request.method == 'POST':
        # upsert event details -> usually a put!
        # whats in the body is overwritten

        # 1. check whats to upsert
        try:data = JSONParser().parse(request)
        except:data = JSONParser().parse(request.body)

        # 2. load corresponding object
        try:
            obj = SarvoGroup.objects.get(pk=objId)  # pk sind parameter
        except SarvoGroup.DoesNotExist:
            return None

        # 3. store if it works
        ok = []
        for param in data:
            try:
                # special update
                if param == "members":
                    [obj.members.remove(o) for o in obj.members.all()] # drop old entries
                    users = SarvoUser.objects.filter(pk__in=data["members"])
                    for user in users:
                        obj.members.add(user)
                    obj.save()
                    ok += [param]
                    continue

                if param == "imageBase64":
                    # compress and store preview image
                    try:
                        if "imageBase64" in data:
                            data["imageBase64"], imagePreviewBase64 = ImageConverter().stdBaseAndPreview(
                                data["imageBase64"])
                            obj.imageBase64 = data["imageBase64"]
                            obj.imagePreviewBase64 = imagePreviewBase64
                            obj.save()
                            ok += ["imageBase64", "imagePreviewBase64"]
                    except:
                        print("resize failed, with error: ")
                        traceback.print_exc()
                    continue

                # standard update
                data[param] = str(data[param])
                exec("obj." + param + " = str(data[param])")
                ok += [param]

            except:
                pass

        obj.save()
        return JsonResponse({"Valid and Set": str(ok)}, status=200)


    return JsonResponse({"ERROR": "Bad request"}, status=400)


@login_required_any_views
@access_validation
def group_delete_member(request, groupId, memberId):
    if request.method == "DELETE":
        group = SarvoGroup.objects.get(pk=groupId)
        member = group.members.get(pk=memberId)
        group.members.remove(member)
        group.save()
        return JsonResponse({"message": "deleted entry %s" % str(memberId)}, safe=False)

    return JsonResponse({"ERROR": "Bad request"}, status=400)


@login_required_any_views
@access_validation
def group_add_get_member(request, objId):

    if request.method == "PUT" or request.method == "POST":
        try:data = JSONParser().parse(request)
        except:data = JSONParser().parse(request.body)
        group = SarvoGroup.objects.get(pk=objId)

        group.members.clear()
        for memberId in list(set(data["user_ids"])):
            group.members.add(SarvoUser.objects.get(pk=memberId))
        group.save()

        return JsonResponse({"message": "Added Member %s" % str(memberId)})

    if request.method == "GET":
        group = SarvoGroup.objects.get(pk=objId)
        members = group.members.all()
        data = {"ids" : [m.id for m in members]}
        return JsonResponse(data, safe=False)

    return JsonResponse({"ERROR": "Bad request"}, status=400)


@login_required_any_views
@access_validation
def group_admins(request, objId):

    if request.method == "PUT" or request.method == "POST":
        try:data = JSONParser().parse(request)
        except:data = JSONParser().parse(request.body)
        group = SarvoGroup.objects.get(pk=objId)

        group.admins.clear()
        for adminId in list(set(data["admin_ids"])):
            group.admins.add(SarvoUser.objects.get(pk=adminId))
        group.save()

        return JsonResponse({"message": "Added admins %s" % str(adminId)})

    if request.method == "GET":
        group = SarvoGroup.objects.get(pk=objId)
        admins = group.admins.all()
        data = {"ids" : [a.id for a in admins]}
        return JsonResponse(data, safe=False)

    return JsonResponse({"ERROR": "Bad request"}, status=400)


@login_required_any_views
@access_validation
def get_members_from_multiple_groups(request):
    # return list of member ids
    try:data = JSONParser().parse(request)
    except:data = JSONParser().parse(request.body)
    id_list = data["group_ids"]

    group_list = SarvoGroup.objects.filter(id__in=id_list)
    participants = []
    for group in group_list:
        participants += [member for member in group.members.all()]
    participants = list(set(participants))

    serializer = UserSerializer(participants, many=True)

    return JsonResponse(serializer.data, safe=False)


@login_required_any_views
@access_validation
def group_members_id(request, objId):
    # returns ids of group members
    userId = request.session["userId"]

    # filter events with this id
    fields = ("id")
    obj_list = SarvoEvent.objects.filter(participants__id__exact=userId).values(fields)
    dat = {"ids": [l["id"] for l in list(obj_list)]}

    return JsonResponse(dat, safe=False)
