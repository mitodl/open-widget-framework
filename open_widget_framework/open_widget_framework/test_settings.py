from __future__ import unicode_literals


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "widgetdb",
        "USER": "widgetuser",
        "PASSWORD": "1",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

CACHES = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}

SITE_ID = 1

MIDDLEWARE = (
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
)

AUTHENTICATION_BACKENDS = ("django.contrib.auth.backends.ModelBackend",)

ROOT_URLCONF = "open_widget_framework.urls"

INSTALLED_APPS = (
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.sites",
    "django.contrib.messages",
    "django.contrib.admin",
    "open_widget_framework",
)

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {
        "open_widget_framework": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        }
    },
}

SECRET_KEY = "super-secret-key-for-testing"

USE_I18N = False

USE_L10N = False

USE_TZ = False

LOGIN_REDIRECT_URL = "/admin/"


# import open_widget_framework Django settings
try:
    from default_settings import *
except ImportError:
    pass
