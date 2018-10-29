from django.conf import settings
from django.utils.module_loading import import_string

WIDGET_CLASSES: [
    'open_widget_framework.widget_classes.TextWidget',
    'open_widget_framework.widget_classes.URLWidget',
    'open_widget_framework.widget_classes.ManyUserWidget',
]


def get_widget_classes():
    try :
        widget_classes = settings.WIDGET_CLASSES
    except AttributeError:
        widget_classes = WIDGET_CLASSES

    imported_widget_classes = [import_string(widget_class) for widget_class in widget_classes]
    return {widget_class.name: widget_class for widget_class in imported_widget_classes}