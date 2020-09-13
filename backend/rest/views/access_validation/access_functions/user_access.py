import warnings


def curuser_idVerify(request):
    # check is he logged in under this user id? else cannot respond
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def curuser_fullVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def curuser_events_fullVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def curuser_eventsVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def user_fullVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def user_full_listVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def user_preview_listVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def user_given_idVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def curuser_groupsVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def curuser_contactsVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def curuser_contacts_add_deleteVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def curuser_contacts_deleteVerify(request, contact_id):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def curuser_contacts_syncVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def curuser_delete_accountVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default
