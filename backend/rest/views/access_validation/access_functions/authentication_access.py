import warnings


def updateVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def registerVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def verifyVerify(request, phonenumber):
    warnings.warn("No verifier implemented for *")
    return False # could return true by default

def logout_callVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def login_callVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def gdpr_consentVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default

def gdpr_consent_version_onlyVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default