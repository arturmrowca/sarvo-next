from rest_framework import serializers
from rest.models_cache import SessionCacheModel


class SessionCacheSerializer(serializers.ModelSerializer):

    class Meta:
        model = SessionCacheModel
        fields = ('id', 'user_id', 'session_id', 'created', 'json_content', 'url', 'status_code', 'body_hash')
