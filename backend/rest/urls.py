from django.conf.urls import url
from django.http import JsonResponse

from engine.cleanup.database_cleanup import DataBaseCleanup
from engine.transmission.push_notification_singleton import PNSingleton
from rest.models import SimpleContent
from rest.views import authentication_view, event_view, chat_view, user_view, group_view, click_stream_view, \
    chat_view_server, invite_view, browse_event_view
import sys
from django.shortcuts import redirect


def justok(request):
    return JsonResponse({}, safe=False, status=200)

# used to forward bike wipe
def forwardBikeWipe(request):#http://localhost:1991/v1-0/forward-please/bikewipe/?mail=sepp@huber.de&model=hallo
    print("In")

    # get info
    from datetime import datetime

    SimpleContent(project="bike-wipe", dateReceived=datetime.now().strftime("%d/%m/%Y %H:%M:%S"), content=str(request.GET)).save()

    return redirect('http://bike-wipe.de/confirm')
    #return JsonResponse({}, safe=False, status=200)

#Definiere hier mein URLs
try:
    xBro = sys.argv[1]
except:
    xBro = "runserver"

if xBro != "runsslserver":

    urlpatterns = [

        # Main App
        url(r'^auth/register/$', authentication_view.register),
        url(r'^auth/update/$', authentication_view.update),
        url(r'^auth/verify/(?P<phonenumber>.+)/$', authentication_view.verify),  # regexp: (%2B)?[0-9], %2B is plus
        url(r'^auth/login/$', authentication_view.login_call),
        url(r'^auth/logout/$', authentication_view.logout_call),
        url(r'^auth/gdprConsent/$', authentication_view.gdpr_consent),
        url(r'^auth/gdprConsentVersion/$', authentication_view.gdpr_consent_version_only),

        url(r'^event/$', event_view.event), # add new event - liste mit a
        url(r'^event/(?P<eventId>[0-9]+)/invite/$', event_view.event_detail_invite), #invite participants
        url(r'^event/(?P<objId>[0-9]+)/$', event_view.event_detail),
        url(r'^event/(?P<objId>[0-9]+)/dateoptions/$', event_view.event_detail_dateoption),  # add and get dateoptions
        url(r'^event/(?P<eventId>[0-9]+)/dateoptions/(?P<dateOptionId>[0-9]+)/$', event_view.event_detail_dateoption_modify), # add and get dateoptions
        url(r'^event/(?P<objId>[0-9]+)/chat/messages/$', event_view.eventchat),  # add and get messages to event chat
        url(r'^event/(?P<objId>[0-9]+)/chat/messages/(?P<minId>[0-9]+)/(?P<numberElemens>[0-9]+)/$', event_view.eventchatSubset),  # add and get messages to event chat
        url(r'^event/(?P<eventId>[0-9]+)/chat/messages/ids/$', event_view.chatMessagesById), # get all message ids
        url(r'^event/(?P<objId>[0-9]+)/chat/message/$', event_view.eventchatSingle),  # add single message to event
        url(r'^event/(?P<eventId>[0-9]+)/imagePreview/$', event_view.event_image_preview),  # add single message to event
        url(r'^event/(?P<eventId>[0-9]+)/imageFull/$', event_view.event_image_full),  # add single message to event
        url(r'^chat/(?P<objId>[0-9]+)/messages/$', chat_view.chatMessagesByIdPost), # add message ids
        url(r'^messages/list/$', chat_view.messages_list), # retrieve messages given id list

        url(r'^dateoption/(?P<objId>[0-9]+)/$', event_view.dateoption_detail),

        url(r'^curuser/id/$', user_view.curuser_id),
        url(r'^curuser/full/$', user_view.curuser_full),
        url(r'^curuser/event/ids/$', user_view.curuser_events),
        url(r'^curuser/event/full/$', user_view.curuser_events_full),
        url(r'^curuser/deleteAccount/$', user_view.curuser_delete_account),

        url(r'^curuser/group/ids/$', user_view.curuser_groups),
        url(r'^curuser/contacts/ids/$', user_view.curuser_contacts),
        url(r'^curuser/contacts/$', user_view.curuser_contacts_add_delete),
        url(r'^curuser/contacts/sync/$', user_view.curuser_contacts_sync),
        url(r'^curuser/contacts/(?P<objId>[0-9]+)/$', user_view.curuser_contacts_delete),

        url(r'^user/(?P<objId>[0-9]+)/full/$', user_view.user_full),
        url(r'^user/full/list/$', user_view.user_full_list),
        url(r'^user/preview/list/$', user_view.user_preview_list),
        url(r'^user/(?P<objId>[0-9]+)/$', user_view.user_given_id),

        url(r'^group/$', group_view.group),  # add group
        url(r'^group/(?P<objId>[0-9]+)/$', group_view.group_detail),  # add group
        url(r'^group/(?P<objId>[0-9]+)/members/$', group_view.group_add_get_member),  # add group and get members
        url(r'^group/(?P<objId>[0-9]+)/admins/$', group_view.group_admins),  # add group and get members
        url(r'^group/members/$', group_view.get_members_from_multiple_groups),  # add group and get members
        url(r'^group/(?P<groupId>[0-9]+)/members/(?P<memberId>[0-9]+)/$', group_view.group_delete_member),  # add group and get members

        # invite people
        url(r'^invite/$', invite_view.invite),  # add group

        # Clickstream
        url(r'^stream/clicks/$', click_stream_view.push_clickstream),  # add group
        url(r'^stream/clicks/last/(?P<lastN>[0-9]+)/$', click_stream_view.push_clickstream),  # add group
        url(r'^stream/feedback/$', click_stream_view.feedback_form),  # add group

        # test index of chatroom
        url(r'^chat/$', chat_view_server.index, name='index'),
        url(r'^chat/(?P<room_name>[^/]+)/$', chat_view_server.room, name='room'),

        # browse events
        url(r'^eventbrowse/categories/$', browse_event_view.availableCategories),
        url(r'^eventbrowse/categories/detail/$', browse_event_view.allBrowseEventsByCategory),
        url(r'^.well-known/acme-challenge/*/$', justok),


        # Side project URLs
        url(r'^forward-please/bikewipe/$', forwardBikeWipe),
    ]
else: # CRON JOB MODE! - will not allow requests
    urlpatterns = []



# Run code
from engine.transmission.reminder import ReminderScheduler

# execute reminder scheduling
import sys
# Start cron job separately ONCE!
if xBro == "runsslserver":# then start reminder separately ONLY!
    print("Starting Reminder")
    d = ReminderScheduler()
    d.run_quarterly()


if DataBaseCleanup().active():
    DataBaseCleanup().run()
    sys.exit(0)

# Push
"""print("PUSHING")
txt = "super test"
push = PNSingleton().chatPush("BORIS", txt)
push.additional["event_id"] = 1
push.post_notification([47])"""
