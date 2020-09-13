# -*- coding: iso-8859-15 -*-
from engine.tools.singleton import Singleton
from engine.transmission.push_notification import PushNotification


class PNSingleton(Singleton):

    def __init__(self):
        self.invitationPusher = PushNotification(push_id="lib.pusher.EventInvitePusher")
        self.chatPusher = PushNotification(push_id="lib.pusher.EventInvitePusher")  # could use other pusher here
        self.reminderPusher = PushNotification(push_id="lib.pusher.EventInvitePusher")  # could use other pusher here

    def invitationPush(self, eventName, organizerName):
        title = "Einladung zu %s" % eventName
        msg = "%s hat dich eingeladen zu einer neuen S'arvo Veranstaltung! Öffne die App für mehr Details. " % organizerName
        self.invitationPusher.set_content(title=title, message=msg)
        return self.invitationPusher

    def chatPush(self, eventName, chatMessage):
        title = "%s" % str(eventName)

        msg = chatMessage
        self.chatPusher.set_content(title=title, message=msg)
        return self.chatPusher

    def reminderPush(self, event_name, location, days = 0, hours = 0, minutes = 0, date = None):

        t = ""
        if days == 1:
            t += "morgen"
        elif days > 1:
            t += str(days)
            t += " Tage"
        else:
            if hours != 0:
                t += str(hours)
                if hours == 1:
                    t += " Stunde"
                else:
                    t += " Stunden"
                if minutes != 0:
                    t += " und "
            if minutes != 0 and days == 0:
                t += str(minutes)
                if minutes == 1:
                    t += " Minute"
                else:
                    t += " Minuten"

        if not (minutes == 0 and hours == 0) and (days == 0 or days > 1):
            prefix = "in "
        else:
            prefix = ""
            if days == 0:
                t = "jetzt"

        if len(location) == 0:
            location = "noch unklar"

        if str(t) == "morgen":
            message = "Es geht bald los! Dein Event startet %s%s! Ort: %s. Wir sehen uns dort, mate!" % (str(prefix), str(t), str(location))
            message = message.replace("in in", "in")
        else:
            message = "Es geht bald los! Dein Event startet in %s%s! Ort: %s. Wir sehen uns dort, mate!" % (str(prefix), str(t), str(location))
            message = message.replace("in in", "in")
            message = message.replace("  ", " ")
            for k in ["55", "56", "57", "58", "59"]:
                message = message.replace("in %s Minuten" % str(k), "in einer Stunde")
            for k in ["2", "3", "4", "5", "6"]:
                message = message.replace("in 1 Stunde und %s Minuten" % str(k), "in einer Stunde")
            message = message.replace("in 1 Stunde und 1 Minute", "in einer Stunde")

        self.reminderPusher.set_content(title="%s am %s" % (str(event_name), str(date.strftime(r"%d/%m/%Y um %H:%M Uhr"))), message=message)
        return self.reminderPusher