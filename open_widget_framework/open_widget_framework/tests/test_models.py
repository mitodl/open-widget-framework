from django.test import TestCase

from open_widget_framework.models import WidgetList, WidgetInstance


class TestModels(TestCase):
    """ Tests models """

    def test_widget_list_get_length(self):
        """ Test get_length function on widget list """
        widget_list = WidgetList.objects.create()
        self.assertEqual(0, widget_list.get_length())

    def test_widget_list_get_widgets(self):
        """ Test get_widgets function on widget list """
        widget_list = WidgetList.objects.create()

        widgets = widget_list.get_widgets()
        self.assertEqual(0, widgets.count())

        configuration = {"body": "example1"}
        widget_class = "Text"
        WidgetInstance.objects.create(widget_list=widget_list, position=0, widget_class=widget_class,
                                      title='Example1', configuration=configuration)
        self.assertEqual(1, widget_list.get_length())
        widgets = widget_list.get_widgets()
        self.assertEqual(1, widgets.count())
        self.assertEqual(configuration, widgets[0].configuration)
