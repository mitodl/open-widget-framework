from django.conf import settings
from django.utils.module_loading import import_string
from open_widget_framework import widget_classes

<<<<<<< HEAD
WIDGET_CLASSES: [
    'widget_classes.TextWidget',
    'widget_classes.URLWidget',
    'widget_classes.ManyUserWidget',
=======
WIDGET_CLASSES = [
    'open_widget_framework.widget_classes.TextWidget',
    'open_widget_framework.widget_classes.URLWidget',
    'open_widget_framework.widget_classes.ManyUserWidget',
>>>>>>> 0d1589f53556266d03cf41a0a1e0275b50fd79a7
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
