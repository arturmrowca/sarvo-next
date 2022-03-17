from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf.urls.static import static
from django.views.static import serve

from free.views import index

urlpatterns = [
    path('', index),
    #path('privacy-policy', privacy_policy),
    #path('about', about),

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


