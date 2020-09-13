import warnings


def eventVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def event_image_previewVerify(request, eventId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def event_image_fullVerify(request, eventId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def event_detail_inviteVerify(request, eventId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def chatMessagesByIdVerify(request, eventId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def eventchatVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def eventchatSubsetVerify(request, objId, minId, numberElemens):
    warnings.warn("No verifier defined")
    return True

def eventchatSingleVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def event_detail_dateoption_modifyVerify(request, eventId, dateOptionId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def event_detail_dateoptionVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def event_detailVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def dateoption_detailVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default
