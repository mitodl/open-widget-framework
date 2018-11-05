"""
This file contains Django settings for open_widget_framework that should be added to your Django settings.
They come with default values.
"""

from django.conf import settings
from django.utils.module_loading import import_string


# The list of the types of widget made available. If you add a new type of widget, include it in this list to
# make it available
WIDGET_CLASSES = [
    'open_widget_framework.widget_classes.TextWidget',
    'open_widget_framework.widget_classes.URLWidget',
    'open_widget_framework.widget_classes.ManyUserWidget',
]


def get_widget_class_dict():
    try:
        widget_classes = settings.WIDGET_CLASSES
    except AttributeError:
        widget_classes = WIDGET_CLASSES

    imported_widget_classes = [import_string(widget_class) for widget_class in widget_classes]
    return {widget_class.name: widget_class for widget_class in imported_widget_classes}


def get_widget_class_configurations():
    widget_classes = get_widget_class_dict()
    return {key: value().get_configuration_form_spec() for (key, value) in widget_classes.items()}
