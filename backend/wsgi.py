"""
WSGI config for project project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

import os
import sys

sys.path.append(r'/opt/bitnami/apps/django/django_projects/sarvo/backend')

os.environ.setdefault("PYTHON_EGG_CACHE", "/opt/bitnami/apps/django/django_projects/sarvo/backend/egg_cache")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")

os.environ['HTTPS'] = "on"
os.environ['wsgi.url_scheme'] = 'https'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
