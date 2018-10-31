"""
WidgetApp models
"""
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from open_widget_framework.default_settings import get_widget_class_dict


class WidgetList(models.Model):
    """WidgetList handles authentication and is linked to a set of WidgetInstances"""
    def can_access(self, user):
        """Return True if user has access to this WidgetList"""
        auth = settings.WIDGET_AUTHENTICATION_BACKEND()
        return auth.can_access_widget_list(self, user)

    def add_widget(self, widget_class, data, position=None):
        if position:
            self.shift_range(start=position, shift=1)
        else:
            position = WidgetInstance.objects.filter(widget_list=self).count()
        WidgetInstance.objects.create(widget_list=self,
                                      widget_class=widget_class,
                                      position=position,
                                      title=data.pop('title'),
                                      configuration=data)

    def remove_widget(self, widget_id):
        widget_to_remove = WidgetInstance.objects.get(id=widget_id)
        widgets_to_move = WidgetInstance.objects.filter(widget_list_id=self.id,
                                                        position__gt=widget_to_remove.position)
        for widget in widgets_to_move:
            widget.position = widget.position - 1
            widget.save()

        widget_to_remove.delete()

    def get_length(self):
        return WidgetInstance.objects.filter(widget_list=self).count()

    def get_widgets(self):
        return WidgetInstance.objects.filter(widget_list=self).order_by('position')

    def clear_list(self):
        for widget in WidgetInstance.objects.filter(widget_list_id=self.id):
            widget.delete()

    def shift_range(self, start=0, end=None, shift=1):
        if not end:
            end = WidgetInstance.objects.filter(widget_list=self).count()
        if start == end:
            return

        widgets_to_shift = [widget for widget in WidgetInstance.objects.filter(widget_list=self)
                            if start <= widget.position < end]

        for widget in widgets_to_shift:
            widget.position = widget.position + shift
            widget.save()



class WidgetInstance(models.Model):
    """WidgetInstance contains data for a single widget instance, regardless of what class of widget it is"""
    widget_list = models.ForeignKey(WidgetList, related_name="widgets", on_delete=models.CASCADE)
    widget_class = models.CharField(max_length=200)
    configuration = JSONField()
    position = models.IntegerField()
    title = models.CharField(max_length=200)

    def get_widget_serializer(self):
        return WidgetInstance.get_widget_serializer(self.widget_class)(widget_instance=self)

    def get_serialized_data(self):
        serializer = self.get_widget_serializer()
        if not serializer.is_valid():
            raise ImproperlyConfigured("%s widget (%s, id: %s) contains invalid information" %
                                       (self.widget_class, self.title, self.id))
        return serializer.data

    def make_render_props(self):
        serializer = self.get_widget_serializer()
        return serializer.render_with_title(self)

    def get_configuration(self):
        return self.get_widget_serializer().get_configuration_form_spec()

    @classmethod
    def get_widget_class_serializer(cls, widget_class_name):
        """Return the class of serializer that can properly validate and render this widget instance"""
        for (key, widget_class) in get_widget_class_dict().items():
            if key == widget_class_name:
                return widget_class
        raise ImproperlyConfigured("no widget of type %s found" % self.widget_class)
