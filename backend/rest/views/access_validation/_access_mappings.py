"""
For every method that is called a check has to be performed if
the current request is valid
For any incoming request it returns True if it is valid and False else

This ensures that only valid requests are made
"""
from rest.views.access_validation.access_functions.authentication_access import *
from rest.views.access_validation.access_functions.chat_access import *
from rest.views.access_validation.access_functions.click_stream_access import *
from rest.views.access_validation.access_functions.event_access import *
from rest.views.access_validation.access_functions.group_access import *
from rest.views.access_validation.access_functions.invite_access import *
from rest.views.access_validation.access_functions.user_access import *
from rest.views.access_validation.access_functions.browse_event_access import *

access_maps = dict() # key: Function name, value: function ingesting same arguments and returning a boolean if the request is valid

# authentication_view
access_maps["update"] = updateVerify
access_maps["register"] = registerVerify
access_maps["verify"] = verifyVerify
access_maps["logout_call"] = logout_callVerify
access_maps["login_call"] = login_callVerify
access_maps["gdpr_consent"] = gdpr_consentVerify
access_maps["gdpr_consent_version_only"] = gdpr_consent_version_onlyVerify

# chat view
access_maps["chatMessagesByIdPost"] = chatMessagesByIdPostVerify
access_maps["messages_list"] = messages_listVerify

# click strem
access_maps["push_clickstream"] = push_clickstreamVerify
access_maps["feedback_form"] = feedback_formVerify

# event access
access_maps["event"] = eventVerify
access_maps["event_image_preview"] = event_image_previewVerify
access_maps["event_image_full"] = event_image_fullVerify
access_maps["event_detail_invite"] = event_detail_inviteVerify
access_maps["chatMessagesById"] = chatMessagesByIdVerify
access_maps["eventchat"] = eventchatVerify
access_maps["eventchatSubset"] = eventchatSubsetVerify
access_maps["eventchatSingle"] = eventchatSingleVerify
access_maps["event_detail_dateoption_modify"] = event_detail_dateoption_modifyVerify
access_maps["event_detail_dateoption"] = event_detail_dateoptionVerify
access_maps["event_detail"] = event_detailVerify
access_maps["dateoption_detail"] = dateoption_detailVerify

# group access
access_maps["group"] = groupVerify
access_maps["group_detail"] = group_detailVerify
access_maps["group_delete_member"] = group_delete_memberVerify
access_maps["group_add_get_member"] = group_add_get_memberVerify
access_maps["group_admins"] = group_adminsVerify
access_maps["get_members_from_multiple_groups"] = get_members_from_multiple_groupsVerify
access_maps["group_members_id"] = group_members_idVerify

# invite access
access_maps["invite"] = inviteVerify

# user access
access_maps["curuser_id"] = curuser_idVerify
access_maps["curuser_full"] = curuser_fullVerify
access_maps["curuser_events_full"] = curuser_events_fullVerify
access_maps["curuser_events"] = curuser_eventsVerify
access_maps["user_full"] = user_fullVerify
access_maps["user_full_list"] = user_full_listVerify
access_maps["user_preview_list"] = user_preview_listVerify
access_maps["user_given_id"] = user_given_idVerify
access_maps["curuser_groups"] = curuser_groupsVerify
access_maps["curuser_contacts"] = curuser_contactsVerify
access_maps["curuser_contacts_add_delete"] = curuser_contacts_add_deleteVerify
access_maps["curuser_contacts_delete"] = curuser_contacts_deleteVerify
access_maps["curuser_contacts_sync"] = curuser_contacts_syncVerify
access_maps["curuser_delete_account"] = curuser_delete_accountVerify

# eventbrowse
access_maps["availableCategories"] = availableCategoriesVerify
access_maps["allBrowseEventsByCategory"] = allBrowseEventsByCategoryVerify
