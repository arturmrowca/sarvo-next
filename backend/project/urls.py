from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.conf.urls import url, include
from django.views.generic import RedirectView
from rest_framework import routers

from project.settings import SITE_VERSION
from rest.views.html_view import PrivacyView

admin.autodiscover()

# Add views
from welcome.views import index, health


urlpatterns = [
    # Examples:
    # url(r'^$', 'project.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),


    url(r'^%s/' % SITE_VERSION, include('rest.urls')),
    url(r'^privacy$', PrivacyView.as_view()),
    url(r'^$', RedirectView.as_view(url='%s/auth/login' % SITE_VERSION, permanent=False), name='index')

]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
