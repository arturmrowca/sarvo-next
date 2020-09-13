# mysite/routing.py
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import rest.routing

"""
This root routing configuration specifies 
that when a connection is made to the 
 development server, the ProtocolTypeRouter 
 will first inspect the type of connection. 
 If it is a WebSocket connection 
 (ws:// or wss://), the connection will 
 be given to the AuthMiddlewareStack."""

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
        URLRouter(
            rest.routing.websocket_urlpatterns
        )
    ),
})