from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

from free.models import FreetimeActivity
from lib.item_filter.main_activity_filter import MainViewActivityFilter as MVAF


@login_required
def index(request):
    # Read information
    currentUser = request.user
    filterCategory1 = [k.lower() for k in request.GET["filterCategory1"].split("<->") if len(k)>0] if "filterCategory1" in request.GET else []

    # Run recommender engine
    # Activities to show on the main page
    queryset = MVAF().getActivities(currentUser, filterCategory1) # Post.objects.order_by("-timestamp")[0:4]

    # Distinct Categories
    category_1_elements = FreetimeActivity.objects.order_by().values('category_level_1').distinct()
    selected_category_1_elements = [c for c in [l["category_level_1"] for l in category_1_elements] if c.lower() in filterCategory1]
    unselected_category_1_elements = [c["category_level_1"] for c in category_1_elements if c["category_level_1"] not in selected_category_1_elements]

    context = {
        'object_list':queryset,
        'unselected_category_1_elements': unselected_category_1_elements,
        'selected_category_1_elements': selected_category_1_elements
    }
    return render(request, "index.html", context)