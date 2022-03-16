import os

import os


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truv.settings')



import sys
sys.path.append('/home/bitnami/travweb/traveweb/django/src')
os.environ.setdefault("PYTHON_EGG_CACHE", "/home/bitnami/travweb/traveweb/django/src/egg_cache")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "truv.settings")

os.environ["HTTPS"] = "on"
os.environ["wsgi.url_scheme"] = "https"

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()