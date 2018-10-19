"""
WidgetApp views
"""
from json import loads

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse

from widget_app.models import WidgetInstance, WidgetList
from widget_app.widget_classes import get_widget_class_dict, get_widget_class_configurations
from widget_app.helpers import get_widget_data, get_widget_list_data


def get_widget_lists(request):
    """
    API endpoint for returning a list of all WidgetList ids
    """
    widget_lists = WidgetList.objects.all().values('id')
    return JsonResponse(list(widget_lists), safe=False)


def get_widget_configurations(request):
    """
    API endpoint for getting all available widget classes and their configurations
    """
    return JsonResponse({'widgetClassConfigurations': get_widget_class_configurations()})


def create_list(request):
    """
    API endpoint to make a new widget list
    """
    WidgetList.objects.create()
    return get_widget_lists(request)


def get_widget_list(request, widget_list_id):
    """
    API endpoint for getting the widgets in a single list

    Args:
        widget_list_id (int): id of desired WidgetList
    """
    widget_class_dict = get_widget_class_dict()

    # Construct a dictionary with id and configuration props to be consumed and rendered by React components
    widget_list = [
        {
            'id': widget.pop('id'),
            'props': widget_class_dict[widget.pop('widget_class')]().render_with_title(request, widget)
        }
        for widget in get_widget_list_data(widget_list_id)]

    return JsonResponse(widget_list, safe=False)


def delete_widget_list(request, widget_list_id):
    """
    API endpoint to delete a widget list

    Args:
        widget_list_id (int): id of WidgetList to delete
    """
    widget_list = get_object_or_404(WidgetList, id=widget_list_id)
    widget_list.delete()
    return get_widget_lists(request)


def create_widget(request, widget_list_id):
    """
    API endpoint to create a widget instance on a list after validating the data with a serializer
    class

    Args:
        widget_list_id: id of WidgetList to add widget to
    """
    widget_class_dict = get_widget_class_dict()
    widget_list = get_object_or_404(WidgetList, id=widget_list_id)
    data = loads(request.body.decode())
    widget_class = data.pop('widget_class')

    # Create a serializer to validate the data
    serializer = widget_class_dict[widget_class](data=data)
    if serializer.is_valid():
        position = WidgetInstance.objects.filter(widget_list=widget_list).count()
        WidgetInstance.objects.create(widget_list=widget_list,
                                      widget_class=widget_class,
                                      position=position,
                                      title=data.pop('title'),
                                      configuration=data)
        return get_widget_list(request, widget_list_id)
    else:
        return JsonResponse('', status=400)


def get_widget(request, widget_id):
    """
    API endpoint to get data for a single widget

    Args:
        widget_id: id of desired Widget
    """
    widget_data = get_widget_data(widget_id, fields=('configuration', 'title', 'widget_class'))
    widget_class = widget_data['widget_class']
    widget_class_configuration = {widget_class: get_widget_class_configurations()[widget_class]}

    # Flatten the configuration dictionary into the widget data for react
    widget_data.update(widget_data.pop('configuration'))

    # Construct a response dictionary with the widget data as well as the appropriate widget class configuration
    response = {
        'widgetData': widget_data,
        'widgetClassConfigurations': widget_class_configuration,
    }
    return JsonResponse(response)


def delete_widget(request, widget_list_id, widget_id):
    """
    API endpoint to delete a specified widget

    Args:
        widget_list_id (int): id of WidgetList containing the Widget
        widget_id (int): id of Widget to delete
    """
    widget = get_object_or_404(WidgetInstance, id=widget_id)
    widget.delete()
    return get_widget_list(request, widget_list_id)


def update_widget(request, widget_list_id, widget_id):
    """
    API endpoint to update the data for a widget instance

    Args:
        widget_list_id (int): id of WidgetList containing the Widget
        widget_id (int): id of Widget to update
    """
    widget_class_dict = get_widget_class_dict()
    widget = get_object_or_404(WidgetInstance, id=widget_id)
    update_data = loads(request.body.decode())

    # validate the data using the widget serializer class and then update
    serializer = widget_class_dict[widget.widget_class](data=update_data)
    if serializer.is_valid():
        widget.title = update_data.pop('title')
        widget.configuration = update_data
        widget.save()
        return get_widget_list(request, widget_list_id)
    else:
        return JsonResponse('', 400)


def move_widget(request, widget_list_id, widget_id):
    """
    API endpoint to reposition a widget within a widget list. It takes the desired position as a
    query parameter

    Args:
        widget_list_id (int): id of WidgetList containing widget
        widget_id (int): id of Widget to reposition
    """
    try:
        target_position = int(request.GET.get('position'))
    except TypeError:
        return HttpResponse(status=400)

    target_widget = get_object_or_404(WidgetInstance, id=widget_id)

    # Handle out of range moves
    if target_position >= len(WidgetInstance.objects.filter(widget_list_id=widget_list_id)):
        target_position = len(WidgetInstance.objects.filter(widget_list_id=widget_list_id)) - 1
    if target_position <= 0:
        target_position = 0

    # return on in-place moves
    if target_widget.position == target_position:
        return get_widget_list(request, widget_list_id)

    # Determine the direction to shift the line and the range of positions that need to shift
    if target_position < target_widget.position:
        shift = 1
        range_to_shift = range(target_position, target_widget.position)
    else:
        shift = -1
        range_to_shift = range(target_widget.position + 1, target_position + 1)

    # make a list of widget in between the target widget and it's target position and shift them
    widgets_in_between = [widget for widget in WidgetInstance.objects.filter(widget_list_id=widget_list_id)
                          .exclude(id=target_widget.id) if widget.position in range_to_shift]
    for widget in widgets_in_between:
        widget.position = widget.position + shift
        widget.save()

    # Update target widget
    target_widget.position = target_position
    target_widget.save()
    return get_widget_list(request, widget_list_id)


def home(request):
    """
    Renders the home page which enables the single page sample react app
    """
    return render(request, 'widget_app/home.html')
