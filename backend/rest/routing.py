# chat/routing.py
from django.conf.urls import url

from . import consumers

websocket_urlpatterns = [
    # redirect chat messages to clients - each being an instance of ChatConsumer
    url(r'^ws/chat/(?P<room_name>[0-9]+)/$', consumers.ChatConsumer),

]