"""
WidgetApp views
"""
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.viewsets import ModelViewSet

from open_widget_framework.models import  WidgetList
from open_widget_framework.widget_serializer import WidgetSerializer, WidgetListSerializer, \
    get_widget_class_configurations
from open_widget_framework.settings import api_settings

# TODO: validate with widget list


def get_widget_configurations(request):
    """
    API endpoint for getting all available widget classes and their configurations
    """
    return JsonResponse({'widgetClassConfigurations': get_widget_class_configurations()})


def make_widget_list_response(queryset):
    return JsonResponse([WidgetSerializer(widget).render_with_title() for widget in queryset], safe=False)


class WidgetListViewSet(ModelViewSet):
    queryset = WidgetList.objects.all()
    serializer_class = WidgetListSerializer
    if api_settings.WIDGET_FRAMEWORK_AUTHENTICATION_CLASSES:
        authentication_classes = api_settings.WIDGET_FRAMEWORK_AUTHENTICATION_CLASSES
    if api_settings.WIDGET_FRAMEWORK_PERMISSION_CLASSES:
        permission_classes = api_settings.WIDGET_FRAMEWORK_PERMISSION_CLASSES

    def list(self, request, *args, **kwargs):
        return JsonResponse([widget_list.id for widget_list in self.get_queryset()], safe=False)

    def retrieve(self, request, *args, **kwargs):
        return make_widget_list_response(self.get_object().get_widgets())

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return self.list(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return self.list(request, *args, **kwargs)


class WidgetViewSet(ModelViewSet):
    serializer_class = WidgetSerializer

    def check_widget_list_edit_permissions(self):
        if api_settings.WIDGET_LIST_EDIT_PERMISSIONS:
            widget_list = get_object_or_404(WidgetList, pk=self.kwargs['widget_list_id'])
            if not self.request.user.has_perms(api_settings.WIDGET_LIST_EDIT_PERMISSIONS, widget_list):
                #TODO Handle permissions denied
                self.permission_denied(self.request, "This user does not have permission to edit that widget list")

    def get_queryset(self):
        return get_object_or_404(WidgetList, pk=self.kwargs['widget_list_id']).get_widgets()

    def retrieve(self, request, *args, **kwargs):
        serializer = self.serializer_class(self.get_object())
        return JsonResponse({
            'widgetClassConfigurations': {
                serializer.data['widget_class']: get_widget_class_configurations()[serializer.data['widget_class']],
            },
            'widgetData': serializer.get_form_data(),
        })

    def create(self, request, *args, **kwargs):
        """
        API endpoint to create a widget instance on a list after validating the data with a serializer
        class
        """
        self.check_widget_list_edit_permissions()
        super().create(request, *args, **kwargs)
        return make_widget_list_response(self.get_queryset())

    def destroy(self, request, *args, **kwargs):
        """
        API endpoint to delete a specified widget
        """
        self.check_widget_list_edit_permissions()
        widget_to_delete = self.get_object()
        for widget in self.get_queryset().filter(position__gt=widget_to_delete.position):
            widget.position -= 1
            widget.save()
        self.perform_destroy(widget_to_delete)
        return make_widget_list_response(self.get_queryset())

    def update(self, request, *args, **kwargs):
        """
        API endpoint to update the data for a widget instance
        """
        #TODO implement?
        self.check_widget_list_edit_permissions()
        super().update(request, *args, **kwargs)
        return make_widget_list_response(self.get_queryset())

    def partial_update(self, request, *args, **kwargs):
        """
        API endpoint to partial update a widget
        """
        self.check_widget_list_edit_permissions()
        if 'position' in request.data:
            queryset = self.get_queryset()
            target_pos = max(0, min(queryset.count() - 1, request.data['position']))
            target_widget = self.get_object()
            current_pos = target_widget.position

            for widget in self.get_queryset():
                if target_pos >= widget.position > current_pos:
                    widget.position -= 1
                    widget.save()
                elif current_pos > widget.position >= target_pos:
                    widget.position += 1
                    widget.save()

        super().partial_update(request, *args, **kwargs)
        return make_widget_list_response(self.get_queryset())
