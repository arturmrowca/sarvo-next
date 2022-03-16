from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect


def index(request):

    queryset = [] # Post.objects.order_by("-timestamp")[0:4]

    context = {
        'object_list':queryset
    }
    return render(request, "index.html", context)