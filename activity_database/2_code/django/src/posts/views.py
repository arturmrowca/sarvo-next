from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect


from lib.search import searchQueryPost

from posts.models import Post, MoneyEntry
from posts.models import PostEntry
from django.db.models import Q
# split words
#from nltk.corpus import stopwords
import re
#import nltk
#from nltk.tokenize import word_tokenize
"""
def searchQueryPost(postObjectClass, postEntryObjectClass, searchTerm):
    
    Return result set of querying a post
    :param queryObjectClass:
    :param query:
    :return:
    return [None]"""


    # Split words
"""text_tokens = word_tokenize(searchTerm)
    tokens_without_sw = [word.lower() for word in text_tokens if not word in stopwords.words() and re.sub('[^a-zA-Z]+', '', word)]

    # 1. Query whole result is in header - always return POST and if existing relevant POST ENTRY
    result1 = [(p, None) for p in postObjectClass.objects.filter(Q(title__icontains=searchTerm) | Q(region__icontains=searchTerm) | Q(country__icontains=searchTerm))]

    # 2. Query whole result is in entry
    result2 = [(p.post, p) for p in postEntryObjectClass.objects.filter(title__icontains=searchTerm)]

    # 3. Query results where most words overlap in header
    results = []
    for word in tokens_without_sw:
        results += [(p, None) for p in postObjectClass.objects.filter(title__icontains=word)]

    # 4. Query results where most words overlap in entry
    resultsB = []
    for word in tokens_without_sw:
        resultsB += [(p.post, p) for p in postEntryObjectClass.objects.filter(title__icontains=word)]

    fin = list(set(result1)) + list(set(result2)) + list(set(results)) + list(set(resultsB))
    fin = list(dict.fromkeys(fin))
    print(fin)
    return fin"""



def index(request):

    queryset = Post.objects.order_by("-timestamp")[0:4]

    context = {
        'object_list':queryset
    }
    return render(request, "index.html", context)

def privacy_policy(request):
    context = {}
    return render(request, "privacy-policy.html", context)


def about(request):
    context = {}
    return render(request, "about.html", context)


def search(request, **kwargs):

    searchTerm = ""
    if kwargs:
        #raise NotImplementedError(kwargs)
        try:
            response = redirect('/search/?searchItem=%s' % (str(request.POST["searchItem"])))
            return response
        except:
            pass

    if request.method == "POST":
        searchTerm = request.POST["searchItem"]

    if request.method == "GET":
        try:
            searchTerm = request.GET["searchItem"]
        except:
            pass

    try:
        queryset = [q[0] for q in searchQueryPost(Post, PostEntry, searchTerm)]
    except:
        import traceback
        traceback.print_exc()
        queryset = []

    print(queryset)
    context = {
        'object_list': queryset,
        'search_term': searchTerm
    }
    return render(request, "search_results.html", context)

def travel_post(request, url):

    chosenPost = Post.objects.filter(url=url).first()
    recPosts = Post.objects.order_by("-timestamp")[0:4]
    context = {
        'post_object': chosenPost,
        'rec_post_objects': recPosts
    }

    return render(request, "travel-post.html", context)


################################################################
# Track Barausgaben
################################################################
def track(request):
    context = {'alert_flag': False}
    return render(request, "money-track.html", context)


def track_post(request):

    username = request.GET["fname"]
    pin = request.GET["pin"]
    description = request.GET["desc"]
    value = request.GET["value"]
    date = request.GET["date"]
    success = False

    if username=="mrowca" and pin=="2804":
        try:
            entry = MoneyEntry()
            entry.user = username
            entry.description = description
            entry.value = float(value.replace(",", "."))
            from datetime import datetime
            try:
                valid_datetime = datetime.strptime(date, '%d.%m.%Y')
            except ValueError:
                # handle this
                valid_datetime = datetime.now()
            entry.date = valid_datetime
            entry.save()
            print("Saved successfully")
            success = True
        except:
            success = False

    context = {'alert_flag': True, "storedOk": success}
    return render(request, "money-track.html", context)


@login_required
def render_dashboardspage(request):

    username = request.user.username

    # expenses
    expenses = MoneyEntry.objects.filter(user=username)
    print([e.value for e in expenses])

    # show dashboards for this exact user
    # https://thinkinfi.com/integrate-plotly-dash-in-django/
    context = {'alert_flag': False}
    return render(request, "money-track.html", context)
