"""
WidgetApp views
"""
from json import loads

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views import View

from open_widget_framework.models import WidgetInstance, WidgetList
from open_widget_framework.helpers import get_widget_data, get_widget_list_data
from open_widget_framework.default_settings import get_widget_class_configurations

#TODO: validate with widget list

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


class WidgetListView(View):
    def get(self, request, widget_list_id):
        """
        API endpoint for getting the widgets in a single list

        Args:
            widget_list_id (int): id of desired WidgetList
        """
        widget_list = get_object_or_404(WidgetList, id=widget_list_id)
        # TODO: widget_list.can_access
        # Construct a dictionary with id and configuration props to be consumed and rendered by React components
        widget_instances = [
            {
                'id': widget.pop('id'),
                'position': widget['position'],
                'widgetProps': WidgetInstance.get_widget_class(widget.widget_class).render_with_title(request, widget)
            }
            for widget in get_widget_list_data(widget_list_id)
        ]

        return JsonResponse(widget_instances, safe=False)

    def post(self, request):
        """
        API endpoint to make a new widget list
        """
        WidgetList.objects.create()
        return get_widget_lists(request)

    def delete(self, request, widget_list_id):
        """
        API endpoint to delete a widget list

        Args:
            widget_list_id (int): id of WidgetList to delete
        """
        widget_list = get_object_or_404(WidgetList, id=widget_list_id)
        # TODO: widget_list.can_access
        widget_list.clear_list()
        widget_list.delete()
        return get_widget_lists(request)


class WidgetView(View):
    def get(self, request, widget_list_id, widget_id):
        """
        API endpoint to get data for a single widget

        Args:
            widget_id: id of desired Widget
        """
        widget_list = get_object_or_404(WidgetList, id=widget_list_id)
        # TODO: widget_list.can_access

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

    def post(self, request, widget_list_id):
        """
        API endpoint to create a widget instance on a list after validating the data with a serializer
        class

        Args:
            widget_list_id: id of WidgetList to add widget to
        """
        widget_list = get_object_or_404(WidgetList, id=widget_list_id)
        # TODO: widget_list.can_access
        data = loads(request.body.decode())

        # Create a serializer to validate the data
        serializer = WidgetInstance.get_widget_class(data.pop('widget_class'))
        if serializer.is_valid():
            serializer.create_widget(widget_list)

            request.method = 'GET'
            return WidgetListView.as_view(request, widget_list_id=widget_list_id)
        else:
            return JsonResponse({'error': 'invalid widget data'}, status=400)

    def delete(self, request, widget_list_id, widget_id):
        """
        API endpoint to delete a specified widget

        Args:
            widget_list_id (int): id of WidgetList containing the Widget
            widget_id (int): id of Widget to delete
        """
        widget_list = get_object_or_404(WidgetList, id=widget_list_id)
        # TODO: widget_list.can_access
        widget_list.remove_widget(widget_id)
        request.method = 'GET'
        return WidgetListView.as_view(request, widget_list_id=widget_list_id)

    def put(self, request, widget_list_id, widget_id):
        """
        API endpoint to update the data for a widget instance

        Args:
            widget_list_id (int): id of WidgetList containing the Widget
            widget_id (int): id of Widget to update
        """
        widget_list = get_object_or_404(WidgetList, id=widget_list_id)
        # TODO: widget_list.can_access

        widget = get_object_or_404(WidgetInstance, id=widget_id)
        update_data = loads(request.body.decode())

        # validate the data using the widget serializer class and then update
        serializer = WidgetInstance.get_widget_class(widget.widget_class)
        if serializer.is_valid():
            widget.title = update_data.pop('title')
            widget.configuration = update_data
            widget.save()
            request.method = 'GET'
            return WidgetListView.as_view(request, widget_list_id=widget_list_id)
        else:
            return JsonResponse({'error': 'invalid update data'}, 400)

    def patch(self, request, widget_list_id, widget_id):
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
            return JsonResponse({'error': 'invalid position'}, 400)

        widget_list = get_object_or_404(WidgetList, id=widget_list_id)
        # TODO: widget_list.can_access

        target_widget = get_object_or_404(WidgetInstance, id=widget_id)

        # Handle out of range moves
        widget_list_length = widget_list.get_length()
        if target_position >= widget_list_length:
            target_position = widget_list_length - 1
        if target_position <= 0:
            target_position = 0

        # return on in-place moves
        if target_widget.position == target_position:
            request.method = 'GET'
            return WidgetListView.as_view(request, widget_list_id=widget_list_id)

        # Shift widget in between the start and end position
        if target_position < target_widget.position:
            widget_list.shift_range(start=target_position, end=target_widget.position, shift=1)
        else:
            widget_list.shift_range(start=target_position + 1, end=target_widget.position + 1, shift=-1)

        # Update target widget
        target_widget.position = target_position
        target_widget.save()
        request.method = 'GET'
        return WidgetListView.as_view(request, widget_list_id=widget_list_id)
