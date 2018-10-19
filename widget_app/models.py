"""
WidgetApp models
"""
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


class WidgetList(models.Model):
    """WidgetList handles authentication and is linked to a set of WidgetInstances"""
    def can_access(self, user):
        """Return True if user has access to this WidgetList"""
        auth = settings.WIDGET_AUTHENTICATION_BACKEND()
        return auth.can_access_widget_list(self, user)


class WidgetInstance(models.Model):
    """WidgetInstance contains data for a single widget instance, regardless of what class of widget it is"""
    widget_list = models.ForeignKey(WidgetList, related_name="widgets", on_delete=models.CASCADE)
    widget_class = models.CharField(max_length=200)
    configuration = JSONField()
    position = models.IntegerField()
    title = models.CharField(max_length=200)

    def get_widget_class(self):
        """Return the class of serializer that can properly validate and render this widget instance"""
        #TODO: this function is not being used right now
        for widget_class in settings.WIDGET_CLASSES:
            if widget_class.name == self.widget_class:
                return widget_class(widget_instance=self)
        raise ImproperlyConfigured("no widget of type %s found" % self.widget_class)
