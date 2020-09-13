from django.http import JsonResponse
from rest_framework.parsers import JSONParser
import traceback



'''
DEFAULT CLASS FOR Requests
'''
class DefaultSender(object):
    def __init__(self, protoClass, serializerClass):
        self.cls = protoClass
        self.serCls = serializerClass
        self._postSerializerCls = None
        self.serializer = None

    def get_request(self, request, lastN= None):
        # lastN returns last N elements

        # called on get
        if not lastN is None:
            objs = self.cls.objects.filter().order_by('-id')[:int(lastN)]
        else:
            objs = self.cls.objects.all()

        serializer = self.serCls(objs, many=True)
        return JsonResponse(serializer.data, safe=False)

    def get_request_list_given_ids(self, request, objectID = None, onlyFirstEntry = False, exclude_fields = []):
        # Parameter kriegen
        try:
            data = JSONParser().parse(request)
        except:
            traceback.print_exc()
            if request.body:
                data = JSONParser().parse(request.body)

        # Filter for requests
        if not objectID is None:
            obj_list = self.cls.objects.filter(pk__in=data["user_ids"])

        # pass to serializer
        serializer = self.serCls(obj_list, many=True)

        # delete excluded fields
        for field in exclude_fields:
            for f in serializer.data:
                del f[field]

        return JsonResponse(serializer.data, safe=False)

    def get_request_list_given_id_list(self, id_list, onlyFirstEntry = False, exclude_fields = []):
        # Filter for requests
        obj_list = self.cls.objects.filter(pk__in=id_list)

        # pass to serializer
        serializer = self.serCls(obj_list, many=True)

        # delete excluded fields
        for field in exclude_fields:
            for f in serializer.data:
                del f[field]

        return JsonResponse(serializer.data, safe=False)

    def get_request_given_id(self, request, objectID = None, additionalData = {}):
        # Parameter kriegen
        try:
            data = JSONParser().parse(request)
        except:
            #traceback.print_exc()
            if request.body:
                data = JSONParser().parse(request.body)

        # Filter for requests
        if not objectID is None:
            obj = self.cls.objects.get(pk=objectID)
        else:
            obj = self.cls.objects.get(pk=data)

        # pass to serializer
        serializer = self.serCls(obj)
        return JsonResponse({**serializer.data, **additionalData}, safe=False)


    def post_request(self, request):
        # called on post
        # add Event
        try:
            data = JSONParser().parse(request)
        except:
            traceback.print_exc()
            data = JSONParser().parse(request.body)

        # pass to serializer
        if not self._postSerializerCls is None:
            serializer = self._postSerializerCls(data=data)
        else:
            serializer = self.serCls(data=data)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

    def post_request_data(self, data):
        # pass to serializer
        if not self._postSerializerCls is None:
            serializer = self._postSerializerCls(data=data)
        else:
            serializer = self.serCls(data=data)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201), serializer
        return JsonResponse(serializer.errors, status=400), None

    def post_request_data_list(self, data_list, opts = {}):
        ids = []
        for data in data_list:

            # pass to serializer
            if not self._postSerializerCls is None:
                self.serializer = self._postSerializerCls(data=data)
            else:
                self.serializer = self.serCls(data=data)

            if self.serializer.is_valid():
                self.serializer.save()
                ids += [self.serializer.data["id"]]

            else:
                return JsonResponse(self.serializer.errors, status=400)
        return JsonResponse({**{"message": "Created", "ids":ids}, **opts}, status=201)

    def defaultDelete(self, primary_key):
        ''' Removes object with primary key
        '''
        try:
            obj = self.cls.objects.get(pk=primary_key)
            obj.delete()
            return JsonResponse({"status": "Deleted"}, status=200)
        except:
            return JsonResponse({"status": "Delete Failed"}, status=401)


    def defaultPush(self, request):
        if request.method == 'GET':  # receive list of all events    curl http://127.0.0.1:8000/events/
            return self.get_request(request)
        elif request.method == 'POST':  # Event hinzufügen    http --json POST http://127.0.0.1:8000/events/ name="Bermann tanz"
            return self.post_request(request)

    def defaultDetailReceive(self, request, id):
        # Parameter kriegen
        try:
            obj = self.cls.objects.get(pk=id)  # pk sind parameter
        except self.cls.DoesNotExist:
            return JsonResponse({"ERROR": "Bad request"}, status=400)

        # Parameterdetails - http --json GET "http://127.0.0.1:8000/events/1/?meinParam1=bla&meinParam2=blub"
        # NOTE: ?meinParam1=bla&meinParam2=blub is optional!
        parameter = request.GET
        print("Received %s" % str(parameter))
        return obj, request, parameter

    def defaultDetailReceiveForeignKey(self, request, foreign_id, foreign_id_name):
        # Parameter kriegen
        try:
            obj = eval("self.cls.objects.filter(%s=%s)" % (foreign_id_name, foreign_id))
            #"self.cls.objects.filter(%s=foreign_id)"
        except self.cls.DoesNotExist:
            return JsonResponse({"ERROR": "Bad request"}, status=400)

        # Parameterdetails - http --json GET "http://127.0.0.1:8000/events/1/?meinParam1=bla&meinParam2=blub"
        # NOTE: ?meinParam1=bla&meinParam2=blub is optional!
        parameter = request.GET
        print("Received %s" % str(parameter))
        return obj, request, parameter

    def defaultDetailPush(self, obj, request):
        ''' Request um das Event zu updaten, entfernen oder empfangen
                PUT = Overwrite
                The PUT method requests that the enclosed entity be stored under the supplied Request-URI. If the
                Request-URI refers to an already existing resource, the enclosed entity SHOULD be considered as a
                modified version of the one residing on the origin server. If the Request-URI does not point to an
                existing resource … the origin server can create the resource with that URI.

                POST = Add Element
                The POST method is used to request that the origin server accept the entity enclosed in the request as a
                new subordinate of the resource identified by the Request-URI … The posted entity is subordinate to that
                URI in the same way that a file is subordinate to a directory containing it, a news article is subordinate
                to a newsgroup to which it is posted, or a record is subordinate to a database
        '''
        if request.method == 'GET':  # receive object -> curl http://127.0.0.1:8000/events/1/
            serializer = self.serCls(obj)
            return JsonResponse(serializer.data)

        elif request.method == 'PUT':  # object überschreiben - http --json PUT http://127.0.0.1:8000/events/4/ name="Bermann tansdfz"
            try:
                data = JSONParser().parse(request)
            except:
                data = JSONParser().parse(request.body)
            serializer = self.serCls(obj, data=data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data)
            return JsonResponse(serializer.errors, status=400)

        elif request.method == 'DELETE':  # Delete Event with ID -> curl -X DELETE http://127.0.0.1:8000/events/1/
            obj.delete()
            return JsonResponse({"Good": "Deleted"}, status=400)

    def setPostProtoSerializer(self, serializerCls):
        ''' If not specified getting and adding use identical serializers'''
        self._postSerializerCls = serializerCls