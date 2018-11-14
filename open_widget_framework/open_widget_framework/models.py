"""
WidgetApp models
"""
from django.db import models
from django.contrib.postgres.fields import JSONField

from open_widget_framework.utils import get_widget_class_dict


class WidgetList(models.Model):
    """WidgetList handles authentication and is linked to a set of WidgetInstances"""
    def get_length(self):
        return WidgetInstance.objects.filter(widget_list=self).count()

    def get_widgets(self):
        return WidgetInstance.objects.filter(widget_list=self).order_by("position")


class WidgetInstance(models.Model):
    """WidgetInstance contains data for a single widget instance, regardless of what class of widget it is"""

    widget_list = models.ForeignKey(
        WidgetList, related_name="widgets", on_delete=models.CASCADE
    )
    widget_class = models.CharField(max_length=200, choices=[(cls, cls) for cls in get_widget_class_dict().keys()])
    react_renderer = models.CharField(max_length=200, null=True)
    configuration = JSONField()
    position = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
