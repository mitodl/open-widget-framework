"""
This file contains Django settings for open_widget_framework that should be added to your Django settings.
They come with default values.
"""
from django.utils.module_loading import import_string

# The list of the types of widget made available. If you add a new type of widget, include it in this list to
# make it available
WIDGET_CLASSES = [
    "open_widget_framework.widget_classes.TextWidget",
    "open_widget_framework.widget_classes.URLWidget",
    "open_widget_framework.widget_classes.ManyUserWidget",
]

SITE_BASE_URL = "https://localhost:8000/api/v1/"

WIDGET_FRAMEWORK_AUTHENTICATION_BACKEND = import_string(
    "open_widget_framework.auth.WidgetFrameworkAuthenticationBackend"
)
