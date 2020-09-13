from rest_framework import serializers
from rest.models import SarvoEvent, SarvoUser, DateOption, SarvoEventChat, EventChatMessage, SarvoGroup
from rest.models_stream import UserClickStreamModel, BasicFeedbackFormModel


class UserClickStreamSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserClickStreamModel
        fields = ('id', 'user_id', 'session_id', 'device_id', 'interface_element_id', 'timestamp','pixel_location_x', 'pixel_location_y', 'click_type', 'next_page', 'current_page')

class BasicFeedbackFormSerializer(serializers.ModelSerializer):

    class Meta:
        model = BasicFeedbackFormModel
        fields = ('id', 'rating', 'category', 'text')
