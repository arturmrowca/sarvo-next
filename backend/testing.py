from engine.transmission.push_notification_singleton import PNSingleton

class Device(object):

    def __init__(self):
        self.token = "ac4636be2714505bf61d0c16b8ad703ee9452587a5a4cbcf2b1cdc8385e32ea5"


if __name__ == "__main__":
    # Import Python code generated by Google's protobuf compiler:

    push = PNSingleton().chatPush("TEST", "BRUMBRUM")
    push.additional["event_id"] = 3
    push.post_ios(Device())