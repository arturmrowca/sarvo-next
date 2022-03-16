
import os
from pathlib import Path

import mimetypes
mimetypes.add_type("text/css", ".css", True)
mimetypes.add_type("text/javascript", ".js", True)
mimetypes.add_type("text/html", ".html", True)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

LOGIN_REDIRECT_URL = '/' # page to be directed to after login

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-w(qi-f#*@4d#=+fi+rjbr&859yl(c^i@-@ysfzxurcb!vp^c)v'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True # WENN IN PRODUCTION -- PROBLEM CSS NOT LOADED FOR NEW DEVICES // ABER NUR PRODUCTIVE SCHNELL

ALLOWED_HOSTS = ["*", "www.travel-recs.com", "travel-recs.com", "3.68.40.240", "127.0.0.1", "192.168.2.112:1991", "192.168.2.112"]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'posts'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware'
]

# CORS Config
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_HEADERS = (
     'x-requested-with',
     'content-type',
     'accept',
     'origin',
     'authorization',
     'x-csrftoken'
)
CORS_ALLOW_CREDENTIALS = False

ROOT_URLCONF = 'truv.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, "templates")],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'truv.wsgi.application'


# SESSIONS
SESSION_ENGINE='django.contrib.sessions.backends.db'
CSRF_COOKIE_SECURE=False #das false
SESSION_COOKIE_SECURE = False #das false
#os.environ['wsgi.url_scheme'] = 'https' #das weg

# Database 2 types
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases
# type 1
sqlitedb = {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': BASE_DIR / 'db.sqlite3',
}

# type 2
postgredb = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': "defaultdb",
        'USER': "doadmin",
        'PASSWORD': "GBtsAE1UGCpmNLZ7",
        'HOST': "sarvo-database-do-user-10003881-0.b.db.ondigitalocean.com",
        'PORT': "25060",
        'OPTIONS': {'sslmode': 'require'},
    }


DATABASES = {
    'default': postgredb # or sqlitedb or postgredb
}



# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'
MEDIA_URL = "/media/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static_in_env")]
VENV_PATH = os.path.dirname(BASE_DIR)
STATIC_ROOT = os.path.join(os.path.join(BASE_DIR, "live_files"), "static_root")  #os.path.join(VENV_PATH, "static_root")
MEDIA_ROOT = os.path.join(os.path.join(BASE_DIR, "live_files"), "media_root") #os.path.join(VENV_PATH, "media_root")

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
