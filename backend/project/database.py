
import os

from django.conf import settings


engines = {
    'sqlite': 'django.db.backends.sqlite3',
    'postgresql': 'django.db.backends.postgresql_psycopg2',
    'mysql': 'django.db.backends.mysql',
}

"""
def config():
    service_name = os.getenv('DATABASE_SERVICE_NAME', '').upper().replace('-', '_')
    if service_name:
        engine = engines.get(os.getenv('DATABASE_ENGINE'), engines['sqlite'])
    else:
        engine = engines['sqlite']
    name = os.getenv('DATABASE_NAME')
    if not name and engine == engines['sqlite']:
        name = os.path.join(settings.BASE_DIR, 'db.sqlite3')
    return {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': "postgres",
        'USER': "dbmasteruser",
        'PASSWORD': "*TB?WLR1XP=fk7~O3v*,osBix]%,K+wi",
        'HOST': "ls-4bd4b70dde975f755fa784f44fb7c6defa761dc9.cp2sma0o3rti.eu-central-1.rds.amazonaws.com",
        'PORT': "5432"
    }
"""
	
"""return {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': "sarvodb",
        'USER': "sarvo",
        'PASSWORD': "YufBBhxTY4AA12FFFfpuS5",
        'HOST': "sarvo.io",
        'PORT': "5432"
    }
"""


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def config():
    service_name = os.getenv('DATABASE_SERVICE_NAME', '').upper().replace('-', '_')
    if service_name:
        engine = engines.get(os.getenv('DATABASE_ENGINE'), engines['sqlite'])
    else:
        engine = engines['sqlite']
    name = os.getenv('DATABASE_NAME')
    if not name and engine == engines['sqlite']:
        name = os.path.join(settings.BASE_DIR, 'db.sqlite3')
    return {
        #'ENGINE': 'django.db.backends.sqlite3',
        #'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': "defaultdb",
        'USER': "doadmin",
        'PASSWORD': "GBtsAE1UGCpmNLZ7",
        'HOST': "sarvo-database-do-user-10003881-0.b.db.ondigitalocean.com",
        'PORT': "25060",
        'OPTIONS': {'sslmode': 'require'},
    }

