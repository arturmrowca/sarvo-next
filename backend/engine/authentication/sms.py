import random
import requests

class SMS(object):

    # Account SID from twilio.com/console
    _account_sid = "ACfdbba3ff997fa04451ac84da0c25f2b0"
    # Auth Token from twilio.com/console
    _auth_token  = "4d500357bd860f7430a18b0a8002144a"
    # the client object we'll be using
    _client = None

    def gen_verfication_code(self):
        '''
        generates a six digit verfication code
        :return: the 6 digit verfication code as string
        '''
        return "%0.6d" % random.randint(0,999999)

    def send_invitation(self, numberToBeInvited: str, inviteesName: str, inviteesNumber: str, eventName: str) -> bool:
        """

        :param numberToBeInvited: number to be invited
        :param inviteesName: who invites?
        :param eventName: Name of the event
        :return:
        """
        iosLink = r"https://apps.apple.com/de/app/sarvo/id1462945156"
        androidLink = r"https://play.google.com/store/apps/details?id=sarvo.release"
        print("Sending SMS to %s" % str(numberToBeInvited))

        # authorization is base64 encoding of format "Username:API key", the following is for
        # "sarvo:'E06A21A0-4203-07CF-542E-68544AB743A6'"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic c2Fydm86RTA2QTIxQTAtNDIwMy0wN0NGLTU0MkUtNjg1NDRBQjc0M0E2',
        }

        # data needs to have double curly braces for format() to work (single ones are used for inserting values)
        data = """
        {{
            "messages":[
                {{
                    "source":"php",
                    "body":"{} {} hat dich zu {} auf s'arvo eingeladen - Lade dir jetzt die app auf iOS unter {} oder auf Android unter {}",
                    "to":"{}"
                }}
            ]
        }}
        """.format(inviteesName, inviteesNumber, eventName, iosLink, androidLink, numberToBeInvited)

        res = requests.post('https://rest.clicksend.com/v3/sms/send', headers=headers, data=data)  #

        if res.status_code == 200:
            print("invite sent to {}".format(numberToBeInvited))
            return True
        return False

    def send_verification(self, number_to_verifiy: str, verification_code: str) -> bool:
        '''
        Sends a verfication sms including some boilerplate text
        :param number_to_verifiy: The number to be verified, encoded e.g. "+940704665808"
        :param verification_code: the Code as string to allow leading zeros
        :return: true if SMS was send successfully
        '''

        # authorization is base64 encoding of format "Username:API key", the following is for
        # "sarvo:'E06A21A0-4203-07CF-542E-68544AB743A6'"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic c2Fydm86RTA2QTIxQTAtNDIwMy0wN0NGLTU0MkUtNjg1NDRBQjc0M0E2',
        }

        # data needs to have double curly braces for format() to work (single ones are used for inserting values)
        data = """
        {{
            "messages":[
                {{
                    "source":"php",
                    "body":"s'arvo code {}",
                    "to":"{}"
                }}
            ]
        }}
        """.format(verification_code, number_to_verifiy)

        res = requests.post('https://rest.clicksend.com/v3/sms/send', headers=headers, data=data)  #

        if res.status_code == 200:
            print("code {} sent to {}".format(verification_code, number_to_verifiy))
            return True
        return False

