import traceback

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
import warnings

from rest.views.access_validation._access_mappings import access_maps


def access_validation(request_func): # NEEDS TO BE THE LAST DECORATOR
    # no login required
    @csrf_exempt
    def wrapper(request, **kwargs):
        warnings.warn("Access validation not implemented for Function %s" % str(request_func))

        # should return error if access denied and function else
        # VORGEHEN
        # -> pro Funktion gibt es eine Validierungsmethode, die man definieren muss - wenn die nicht definiert ist kommt ein Fehler
        # -> Bei Programmstart checke alle views vs. ob es defineirt ist

        # Check if element is in access_map -> if not define it in access_mappings
        def x(r, **kwargs):
            return True
        access_maps["wrapper"] = x
        if not request_func.__name__ in access_maps:
            raise NotImplementedError("No Validator defined for %s For all methods that are called in view a access validation needs to be called. Define it in access_functions." % request_func.__name__)
            return JsonResponse({"MESSAGE": "ACCESS COULD NOT BE VERIFIED. Verifier not implemented"}, status=400)

        # Check if this request is valid
        isValidRequest = access_maps[request_func.__name__](request, **kwargs)
        if not isValidRequest:
            return JsonResponse({"MESSAGE": "SORRY BRO -> YOU HAVE NO ACCESS TO THIS INFORMATION. GO HOME AND TRY IT SOME OTHER TIME OR CONTACT OUR SARVO CUSTOMER SERVICE. WE LOVE YOU!"}, status=400)



        return request_func(request, **kwargs)
    return wrapper



