"""
WidgetApp views
"""
from django.db.transaction import atomic
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

from open_widget_framework.models import WidgetList, WidgetInstance
from open_widget_framework.widget_serializer import WidgetSerializer, WidgetListSerializer, \
    get_widget_class_configurations
from open_widget_framework.settings import api_settings

# TODO: validate with widget list


def make_widget_list_response(queryset):
    """
    make_widget_list_response takes a queryset of widgetInstances and returns a list of widgets serialized and rendered
        with their title. This is the response for most of the widget level api endpoints so that the frontend can
        update it's widget-list
    """
    return JsonResponse([WidgetSerializer(widget).render_with_title() for widget in queryset], safe=False)


class WidgetListViewSet(ModelViewSet):
    """
    WidgetListViewSet handles requests at the widget-list level with the following mapping (as reflected in urls.py):
        get_lists (GET with no list ID) -> list
        GET (with list ID) -> retrieve
        POST -> create
        DELETE -> destroy

        It also implements authentication and permissions if they are defined in the widget-framework settings
    """
    queryset = WidgetList.objects.all()
    serializer_class = WidgetListSerializer

    @action(detail=False)
    def get_configurations(self, request):
        """
        API endpoint for getting all available widget classes and their configurations
        """
        return JsonResponse({'widgetClassConfigurations': get_widget_class_configurations()})

    def retrieve(self, request, *args, **kwargs):
        """
        API endpoint that returns an ordered list of rendered widgets from a specific widget-list
        """
        return make_widget_list_response(self.get_object().get_widgets())


class WidgetViewSet(ModelViewSet):
    """
    WidgetViewSet handles requests at the widget level with the following mapping (as reflected in urls.py):
        GET -> retrieve
        POST -> create
        DELETE -> destroy
        PUT -> update
        PATCH -> partial_update
    """
    serializer_class = WidgetSerializer

    def get_widget_list(self, widget_list_id=None):
        if self.request.method == 'POST':
            widget_list_id = self.request.data['widget_list']
        elif widget_list_id is None:
            widget_list_id = get_object_or_404(WidgetInstance, pk=self.kwargs['pk']).widget_list_id
        return get_object_or_404(WidgetList, pk=widget_list_id)

    def check_widget_list_edit_permissions(self):
        """
        check_widget_list_edit_permissions check to see that the user making the request has the object level
            permissions specified in the widget-framework settings module to make edits to a widget list.
        """
        if api_settings.WIDGET_LIST_EDIT_PERMISSIONS:
            widget_list = self.get_widget_list()
            if not self.request.user.has_perms(api_settings.WIDGET_LIST_EDIT_PERMISSIONS, widget_list):
                #TODO Handle permissions denied
                self.permission_denied(self.request, "This user does not have permission to edit that widget list")

    def get_queryset(self, widget_list_id=None):
        """
        get_queryset returns all widgets belonging to the list specified in kwargs['widget_list_id']
        """
        return self.get_widget_list(widget_list_id=widget_list_id).get_widgets()

    def retrieve(self, request, *args, **kwargs):
        """
        retrieve is used for acquiring data to update a widget. It returns the configuration for form rendering and the
            widgetData for the widget specified
        """
        serializer = self.serializer_class(self.get_object())
        return JsonResponse({
            'widgetClassConfigurations': {
                serializer.data['widget_class']: get_widget_class_configurations()[serializer.data['widget_class']],
            },
            'widgetData': serializer.get_form_data(),
        })

    def create(self, request, *args, **kwargs):
        """
        API endpoint to create a widget instance on a list after validating the data with the serializer class.
            Returns the updated widget-list
        """
        self.check_widget_list_edit_permissions()
        super().create(request, *args, **kwargs)
        return make_widget_list_response(self.get_queryset())

    @atomic
    def destroy(self, request, *args, **kwargs):
        """
        API endpoint to delete a widget instance from a list and reposition the remaining widgets on the list.
            Returns the updated widget list
        """
        self.check_widget_list_edit_permissions()
        widget_to_delete = self.get_object()
        widget_list_id = widget_to_delete.widget_list_id
        for widget in self.get_queryset().filter(position__gt=widget_to_delete.position).select_for_update():
            widget.position -= 1
            widget.save()
        self.perform_destroy(widget_to_delete)
        return make_widget_list_response(self.get_queryset(widget_list_id=widget_list_id))

    def update(self, request, *args, **kwargs):
        """
        API endpoint to update the data for a widget instance. There are no frontend components that currently
            make this request.
            Returns an updated widget-list
        """
        #TODO implement?
        self.check_widget_list_edit_permissions()
        super().update(request, *args, **kwargs)
        return make_widget_list_response(self.get_queryset())

    @atomic
    def partial_update(self, request, *args, **kwargs):
        """
        API endpoint to partially update a widget. If position is being updated (to move a widget around), the function
            first repositions the other widgets to maintain list order.
            Returns an updated widget list
        """
        self.check_widget_list_edit_permissions()
        queryset = self.get_queryset().select_for_update()
        if 'position' in request.data and 0 <= request.data['position'] <= (queryset.count() - 1):
            target_pos = request.data['position']
            target_widget = self.get_object()
            current_pos = target_widget.position

            for widget in queryset:
                if target_pos >= widget.position > current_pos:
                    widget.position -= 1
                    widget.save()
                elif current_pos > widget.position >= target_pos:
                    widget.position += 1
                    widget.save()

        super().partial_update(request, *args, **kwargs)
        return make_widget_list_response(self.get_queryset())
