from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf.urls.static import static

from fill.filler_main import fill_main
from posts.views import index, travel_post, search, privacy_policy, about, track, track_post, render_dashboardspage

from django.views.static import serve

urlpatterns = [
    path('', index),
    path('privacy-policy', privacy_policy),
    path('about', about),

    path('post/', travel_post),
    path('post/<str:url>/', travel_post),

    path('search/', search),
    path('search/<str:url>/', search),

    ################################################
    # Expense Tracker
    ################################################
    path('money/track', track),
    path('money/track/post', track_post),
    path('money/dashboards/main', render_dashboardspage),

    # Admin: https://learndjango.com/tutorials/django-login-and-logout-tutorial
    #
    # The URLs provided by auth are:
    # accounts/login/ [name='login']
    # accounts/logout/ [name='logout']
    # accounts/password_change/ [name='password_change']
    # accounts/password_change/done/ [name='password_change_done']
    # accounts/password_reset/ [name='password_reset']
    # accounts/password_reset/done/ [name='password_reset_done']
    # accounts/reset/<uidb64>/<token>/ [name='password_reset_confirm']
    # accounts/reset/done/ [name='password_reset_complete']

    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),

]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root = settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
else:
    urlpatterns += [re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT})]
    urlpatterns += [re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT})]

    #urlpatterns += static(settings.STATIC_URL, document_root = settings.STATIC_ROOT)
    #urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)


############################################
# Start filler
############################################
import sys
try:
    if sys.argv[2].split(":")[-1] == "9999":
        import logging
        import threading
        import time

        def thread_function(name):
            logging.info("Thread %s: starting", name)
            fill_main()
            logging.info("Thread %s: finishing", name)

        format = "%(asctime)s: %(message)s"
        logging.basicConfig(format=format, level=logging.INFO,
                                datefmt="%H:%M:%S")

        x = threading.Thread(target=thread_function, args=(1,))
        x.start()

except:
    pass
# TEST# TEST# TEST# TEST# TEST# TEST# TEST# TEST# TEST# TEST# TEST
#searchQueryPost(Post, PostEntry, "Lombard")


