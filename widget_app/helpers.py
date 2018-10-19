"""
WidgetApp helper functions
"""
from widget_app.models import WidgetInstance


def get_widget_list_data(widget_list_id, fields=None):
    """
    Get fields of WidgetList
    Args:
        widget_list_id (int): id of WidgetList to get
        fields (tuple): fields to get from widgets in WidgetList

    Returns: (list): dictionaries of {field_names: values} for widgets in WidgetList
    """
    if widget_list_id is None:
        return None

    if fields is None:
        fields = ('id', 'widget_class', 'configuration', 'title', 'position')

    return list(WidgetInstance.objects.filter(widget_list_id=widget_list_id).order_by('position').values(*fields))


def get_widget_data(widget_id, fields=None):
    """
    Get fields of WidgetInstance
    Args:
        widget_id (int): id of WidgetInstance to get
        fields (tuple): fields to get from WidgetInstance

    Returns: (dict): {field_names: values} for fields of WidgetInstance
    """
    if widget_id is None:
        return None

    if fields is None:
        fields = ('id', 'widget_class', 'configuration', 'title', 'position')

    query = WidgetInstance.objects.filter(id=widget_id)
    if not query:
        return {}

    return list(query.values(*fields))[0]
