import warnings


def groupVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default


def group_detailVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default


def group_delete_memberVerify(request, groupId, memberId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default


def group_add_get_memberVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default


def group_adminsVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default


def get_members_from_multiple_groupsVerify(request):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default


def group_members_idVerify(request, objId):
    warnings.warn("No verifier implemented for *")
    return True # could return true by default
