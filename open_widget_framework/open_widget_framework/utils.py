from django.utils.module_loading import import_string

from open_widget_framework.settings import api_settings


def get_widget_class_dict():
    """
    get_widget_class_dict constructs a dictionary of widget_class names to widget_class objects. This is the sole means
        by which widget_classes are listed and defined.
    """
    widget_classes = api_settings.WIDGET_CLASSES

    imported_widget_classes = [
        import_string(widget_class) for widget_class in widget_classes
    ]
    return {widget_class.name: widget_class for widget_class in imported_widget_classes}
