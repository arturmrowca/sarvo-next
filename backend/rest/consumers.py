# chat/consumers.py
import warnings

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json

class ChatConsumer(WebsocketConsumer):
    """
    When a user posts a message, a JavaScript function will transmit the message over WebSocket to a ChatConsumer. The ChatConsumer will receive that message and forward it to the group corresponding to the room name. Every ChatConsumer in the same group (and thus in the same room) will then receive the message from the group and forward it over WebSocket back to JavaScript, where it will be appended to the chat log.

    Obtains the 'room_name' parameter from the URL route in chat/routing.py that opened the WebSocket connection to the consumer.
Every consumer has a scope that contains information about its connection, including in particular any positional or keyword arguments from the URL route and the currently authenticated user if any.

        self.scope[‘url_route’][‘kwargs’][‘room_name’]
    Obtains the 'room_name' parameter from the URL route in chat/routing.py that opened the WebSocket connection to the consumer.
    Every consumer has a scope that contains information about its connection, including in particular any positional or keyword arguments from the URL route and the currently authenticated user if any.

    self.room_group_name = ‘chat_%s’ % self.room_name
    Constructs a Channels group name directly from the user-specified room name, without any quoting or escaping.
    Group names may only contain letters, digits, hyphens, and periods. Therefore this example code will fail on room names that have other characters.

    async_to_sync(self.channel_layer.group_add)(…)
    Joins a group.
    The async_to_sync(…) wrapper is required because ChatConsumer is a synchronous WebsocketConsumer but it is calling an asynchronous channel layer method. (All channel layer methods are asynchronous.)
    Group names are restricted to ASCII alphanumerics, hyphens, and periods only. Since this code constructs a group name directly from the room name, it will fail if the room name contains any characters that aren’t valid in a group name.

    self.accept()
    Accepts the WebSocket connection.
    If you do not call accept() within the connect() method then the connection will be rejected and closed. You might want to reject a connection for example because the requesting user is not authorized to perform the requested action.
    It is recommended that accept() be called as the last action in connect() if you choose to accept the connection.

    async_to_sync(self.channel_layer.group_discard)(…)
    Leaves a group.
    async_to_sync(self.channel_layer.group_send)
    Sends an event to a group.
    An event has a special 'type' key corresponding to the name of the method that should be invoked on consumers that receive the event.

    """

    def connect(self):
        """
        HERE NEED TO ADD AUTHENTICATION
        And then in your connect method, you can access the user from
        self.scope['user'] feel free to save this onto your consumer instance.
        By trying to read the user from the scope you will ensure a user object was resolved.
        you can do this before calling self.accept() in the connect method if you so wish to ensure the WebSocket connection is not accepted if the user auth failed.

        :return:
        """

        # a) Authentication
        # b) check if he is allowed for this chat
        print("TODO------------> ")
        print("User for auth %s" % str(self.scope["user"]))
        print("Read user id from here as well from auth object else not accept")

        self.room_name = self.scope['url_route']['kwargs']['room_name'] # room_name == event_id here
        self.room_group_name = 'chat_%s' % self.room_name


        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        try:
            sender = text_data_json['sender_id']
        #receiver = self._cur_user_id

            print("\nSender: %s" % str(sender))
        except:
            sender = 3
        print("Receive: %s" % str(message))

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                "sender_id": str(sender)
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']
        sender = event['sender_id'] # set the id received from cur_user_id
        print("TODO use sender that I get from authentication")

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message,
            "sender_id": str(sender)
        }))