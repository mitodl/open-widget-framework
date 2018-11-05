from open_widget_framework.models import WidgetList, WidgetInstance
from open_widget_framework.widget_classes import TextWidget

from hypothesis.extra.django import TestCase
from hypothesis.extra.django.models import models
from hypothesis import given, strategies
from hypothesis.strategies import text

class TestModels(TestCase):
    """ Tests models """

    @given(models(WidgetList))
    def test_widget_list_add(self, widgetlist):
        widget_list_count = widgetlist.get_length()
        widgetlist.add_widget(TextWidget, {"title": "example", "body": "example"})
        self.assertEqual(widgetlist.get_length(), widget_list_count + 1)
