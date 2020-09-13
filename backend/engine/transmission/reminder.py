import sched, time

import threading
import traceback
from collections import namedtuple
from random import random

from apscheduler.schedulers.blocking import BlockingScheduler
from engine.tools.singleton import Singleton
import warnings

from rest.models import DateOption

warnings.filterwarnings("ignore")
from datetime import datetime, timedelta


class ReminderScheduler(Singleton):

    def __init__(self):
        super().__init__()
        self.enable_actual_push = True # only if true a real push is sent! (Debugging purpose)
        self.reminder_times = []
        self.repeat_period = 5 # minutes
        self.notification_frequencies = self._set_notification_frequencies()
        self._local_hour_shift = 2 # adds this much hours on every event - datetime for germany - 2== Germany Sommerzeit

    def _set_notification_frequencies(self):

        TriggerIntervals = namedtuple('TriggerIntervals', 'days, hours, minutes')

        frequencies = [] # SHOULD BE ORDERED FROM LATE TO EARLY

        # 24 hours before event
        frequencies += [TriggerIntervals(days=1, hours=0, minutes=0)]

        # 4 hours before event
        #frequencies += [TriggerIntervals(days=0, hours=4, minutes=0)]

        # 60 Min before event
        frequencies += [TriggerIntervals(days=0, hours=0, minutes=60)]

        # 15 Min before event
        #frequencies += [TriggerIntervals(days=0, hours=0, minutes=15)]

        return frequencies

    def run_quarterly(self):
        """
        All 15 minutes send push notification to peoples and its events
        :return:
        """

        scheduler = BlockingScheduler()
        try:
            #scheduler.add_job(self.push_reminder, 'interval', minutes = self.repeat_period)
            scheduler.add_job(self.push_reminder, trigger='cron', minute = "*/" + str(self.repeat_period)) # called every rp minutes
            print("-------------------------------------\nStarted cron scheduler at Frequency %s Minutes\n-------------------------------------" % str(self.repeat_period))
            t1 = threading.Thread(target=scheduler.start)
            t1.start()
        except:
            pass

    def push_reminder(self):
        """
        Push a reminding message within regular times
        :return:
        """
        print("------------------------------\nREMINDER STARTING \n%s\n------------------------------" % str(datetime.now()))

        try:
            # Get all events that start within one hour
            from rest.models import SarvoEvent
            # Define range
            now = datetime.now() + timedelta(hours=self._local_hour_shift)
            earlier = now - timedelta(hours=0)
            offset = timedelta(minutes=self.repeat_period + 2) # 24 hours +- offset will be send NEEDS to be smaller than 15 mins

            # prefilter to relevant events
            interval = self.notification_frequencies[0]
            later = now + timedelta(days=interval.days, hours=interval.hours,minutes=interval.minutes) + offset
            subset = SarvoEvent.objects.filter(fixed_date__range=(earlier, later))

            # 1. Filter earlier than closest
            for interval in self.notification_frequencies:
                print("\n" + str(interval))
                event_time = now + timedelta(days=interval.days, hours=interval.hours,minutes=interval.minutes)  # e.g. in 24 hours
                later = event_time + offset  # e.g. 24 hours and 10 mins
                earlier = event_time - offset  # e.g. 23:50
                event_set = subset.filter(fixed_date__range=(earlier, later))
                print("Filtering within %s and %s" % (str(earlier), str(later)))

                # 2. Avoid repushing
                # in corresponding date option take note
                event_set2 = event_set
                event_set = []
                for event in event_set2:
                    if event.fixed_date_option_id == -1:continue
                    option = DateOption.objects.get(pk=event.fixed_date_option_id)
                    # a) if sent for the first time set initial entry
                    if option.notification_status == "Empty" or option.notification_status is None:
                        option.notification_status = '{"related_time":"%s", "notifications_sent":[]}' % option.date
                        option.save()


                    # a) check if this notification date was already used
                    option_note = eval(option.notification_status)

                    # b) related Date changed -> reset all notifications
                    if option_note["related_time"] != option.date:
                        option.notification_status = '{"related_time":"%s", "notifications_sent":[]}' % option.date
                        option.save()
                        option_note = eval(option.notification_status)

                    # c) check if this notification was already sent
                    notification_id = "%d-%d-%d" % (interval.days, interval.hours, interval.minutes)
                    if notification_id in option_note["notifications_sent"]:
                        continue # do not send anything again
                    else: # add it to not resend it
                        option_note["notifications_sent"].append(notification_id)
                        option.notification_status = str(option_note)
                        option.save()

                    # d) if all conditions are valid send the current notification
                    event_set += [event]

                print(str([e.name for e in event_set]))
                self.push_to_events(event_set)

        except:
            #traceback.print_exc()
            pass

    def push_to_events(self, target_events):
        from engine.transmission.push_notification_singleton import PNSingleton
        from datetime import datetime, timedelta
        now = datetime.now() + timedelta(hours=self._local_hour_shift)

        time.sleep(10*random())# sleep randomly

        for ev in target_events:
            # for testing push only to me!
            fixed_date = ev.fixed_date
            option_id = ev.fixed_date_option_id
            event_name = ev.name
            location = ev.location
            receivers = [e.id for e in ev.participants.all()]

            # in der Dateoption speichere (a) Zeit die ich beziehe (b) ob ich diese Zeit schon erinnert habe

            time_to_event = fixed_date.replace(tzinfo=None) - now
            days_to_event = time_to_event.days
            hours_to_event, remainder = divmod(time_to_event.seconds, 3600)
            minutes_to_event, seconds_to_event = divmod(remainder, 60)
            print("%s %s %s %s %s" % (str(fixed_date), str(option_id), str(event_name), str(receivers), str(hours_to_event)))

            # Events starting soon
            if receivers:
                print("Pushing!")
                push = PNSingleton().reminderPush(event_name, location, days=days_to_event, hours=hours_to_event, minutes = minutes_to_event, date = fixed_date )
                print("Title %s\nMessage: %s" % (str(push._title), str(push._message)))
                if self.enable_actual_push:
                    push.post_notification(receivers)
                else:
                    print("real pushing disabled")
