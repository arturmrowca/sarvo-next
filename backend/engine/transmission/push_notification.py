import json
import warnings

import threading
import requests
try:
    from rest.models import Device
except:
    pass # for testing disable
from engine.transmission.push_notification_ios import ApnsPusher


class PushNotification(object):

    def __init__(self, push_id, title="", message="", sound="", image=""):

        # set from firebase in android
        self.android_server_key = "AAAAUPBgX_Y:APA91bH0UXbHisE-4GCXJXw-PeRcGxyfNnVZONpO7Db_CdxZ98V7qO7t4OYrVUPckZs3x4K0IpA0ZCJmEWHxWAdkNn-Hvw-26I1HaXUXeUq9ag11XBNYXvdfoJOVBVgF-HlC25ypJm7D"

        # set from ios
        self.apns_key_id = 'DL62494RSF'
        self.apns_key_name = 'AuthKey_DL62494RSF.p8'
        self.team_id = '53WG8ZJ3KX'
        self.bundle_id = 'Artur-Mrowca'
        self.isProduction = True

        self._id = push_id  # unique push ID that identifies the function on the client to be called

        self._title = title  # title of the message
        self._message = message  # message
        self._sound = sound  # message
        self._image = image

        self.additional = {}  # additional key value pairs to add

    def set_content(self, title="", message="", sound="", image=""):
        '''
        Set the content of the notification message to send
        :return:
        '''
        self._title = title  # title of the message
        self._message = message  # message
        self._sound = sound  # message
        self._image = image

    def post_notification(self, target_user_ids):
        t1 = threading.Thread(target=self.post_notification_1, args=(target_user_ids,))
        t1.start()

    def post_notification_1(self, target_user_ids):
        '''
        Post a notification to user with the defined user id
            - if multiple devices are available send notification to all of them
        :param target_user_ids: list of user ids
        :return:
        '''

        for user_id in set(target_user_ids):
            # Retrieve target devices
            devices = Device.objects.filter(sarvoUser=user_id)
            # [(d.sarvoUser.name, d.sarvoUser.id, d.sarvoUser.phonenumber) for d in Device.objects.all()]
            # [(sarvoUser.name, sarvoUser.id, sarvoUser.phonenumber) for sarvoUser in SarvoUser.objects.all()]
            # send to each device
            for device in devices:
                try:
                    if device.platform == "android":
                        self.post_android(device)
                    if device.platform == "ios":
                        self.post_ios(device)
                    if device.platform == "browser":
                        self.post_browser(device)
                except:
                    try:
                        print("PUSH NOTIFICATION FAILED FOR %s %s" % (str(device.sarvoUser.id), str(device.platform)))
                    except:
                        pass

    def post_android(self, device):

        # data
        data = {}
        if self._title: data["title"] = self._title
        if self._message: data["body"] = self._message
        if self._sound: data["sound"] = self._sound
        if self._image: data["image"] = self._image
        data["pushId"] = self._id

        data = {**data, **self.additional}

        # payload
        payload = {"notification": data, "to": device.token}
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain',
                   'Authorization': 'key=%s' % self.android_server_key}

        # send notification
        url = "https://fcm.googleapis.com/fcm/send"
        print(json.dumps(payload))
        r = requests.post(url, data=json.dumps(payload), headers=headers)
        print(str(r))

    def post_ios(self, device):

        app = ApnsPusher(apns_key_id=self.apns_key_id, apns_key_name=self.apns_key_name, team_id=self.team_id,
                         bundle_id=self.bundle_id)
        device_id = device.token  # "c5ec4e50087baf1da491a2833c774007b6e1691174b2ee9add25177ab771db00"
        print("Push to %s" % str(device_id))
        app.push(self._title, self._message, device_id, self.isProduction)

    def post_browser(self, device):
        warnings.warn("Not Implemented post_browser")
