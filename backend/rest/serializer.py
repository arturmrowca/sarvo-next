from rest_framework import serializers
from rest.models import SarvoEvent, SarvoUser, DateOption, SarvoEventChat, EventChatMessage, SarvoGroup, Contacts, \
    BrowseEvent


class DefaultClassSerializer(serializers.Serializer):

    def create(self, validated_data):
        # create and return instance of an Event
        return self.__class__.cls.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # update and return an existing Event instance, given validated data

        instance.name = validated_data.get('name', instance.name)
        # todo: add more here if required

        instance.save() # saves the instance

        return instance

class UserSerializer(DefaultClassSerializer):
    cls = SarvoUser
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=100)
    phonenumber = serializers.CharField(max_length=50, default="Empty")
    profilePictureBase64 = serializers.CharField(max_length=1000000,  default="Empty")
    profilePicturePreviewBase64 = serializers.CharField(max_length=1000000, default="Empty")
    createdProfileDate = serializers.DateTimeField(default="2000-12-23T00:00:00Z")  # given implicitly
    role = serializers.CharField(max_length=50, default="user")
    isRegistered = serializers.BooleanField(default=True)
    connectToCalendar = serializers.BooleanField(default=False)
    agreedDSGVO = serializers.CharField(max_length=50, default="0")

class UserIdSerializer(DefaultClassSerializer):
    cls = SarvoUser
    id = serializers.IntegerField()

class DateOptionSerializer(serializers.ModelSerializer):
    acc_participants = serializers.PrimaryKeyRelatedField(queryset=SarvoUser.objects.all(), many=True)
    inter_participants = serializers.PrimaryKeyRelatedField(queryset=SarvoUser.objects.all(), many=True)
    dec_participants = serializers.PrimaryKeyRelatedField(queryset=SarvoUser.objects.all(), many=True)

    class Meta:
        model = DateOption
        fields = ('id', 'date', 'acc_participants', 'inter_participants', 'dec_participants', 'event')

class BrowseEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrowseEvent
        fields = ('date', 'title', 'image', 'description', 'starChosen', 'categoryTitle', 'location')


class EventSerializer(serializers.ModelSerializer):
    '''
    Note: Um etwas jetzt zu verschicken schreibe:
        - erzeuge meine Event Instanz:
            event = Event(name="Oma suff")
            # speichern in DB
            event.save()
        - Serialisieren
            serializer = EventSerializer(event)

        - In Json/Protobuff umwandeln und das was rauskommt kann ich senden
            content = JSONRenderer().render(serializer.data)
    '''
    class Meta:
        model = SarvoEvent
        fields = ('id', 'name', 'organizer', 'location', 'imageBase64', 'imagePreviewBase64', 'description', 'organization_status', 'participants', 'fixed_date_option_id', 'fixed_date')

class EventChatProtoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SarvoEventChat
        fields = ('id', 'event')

class EventChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventChatMessage
        fields = ('id', 'sender', 'text', 'sentTime', 'receivedBy', 'readBy', 'eventChat')

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model=SarvoGroup
        fields = ('id', 'name', 'imageBase64', 'imagePreviewBase64', 'description', 'members', 'created', 'admins', 'events')


class ContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model=Contacts
        fields = ('id', 'sarvoUser', 'contacts')
