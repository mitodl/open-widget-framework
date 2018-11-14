from django.test import TestCase

from open_widget_framework.models import WidgetList, WidgetInstance



class TestModels(TestCase):
    """ Tests models """

    def test_widget_list_get_length(self):
        widget_list = WidgetList.objects.create()
        self.assertEqual(0, widget_list.get_length())

    def test_widget_list_get_widgets(self):
        widget_list = WidgetList.objects.create()

        widgets = widget_list.get_widgets()
        self.assertEqual(0, widgets.count())

        widget_data = {"title": "example1", "body": "example1"}
        widget_class = "Text"
        widget_list.add_widget(widget_class, dict(widget_data))
        self.assertEqual(1, widget_list.get_length())
        widgets = widget_list.get_widgets()
        self.assertEqual(1, widgets.count())
        self.assertEqual(widget_data, widgets[0].get_serialized_data())

    def test_widget_list_add_widget(self):
        widget_list = WidgetList.objects.create()
        widget1_data = {"title": "example1", "body": "example1"}
        widget1_class = "Text"
        widget_list.add_widget(widget1_class, dict(widget1_data))
        widget1 = WidgetInstance.objects.get(title=widget1_data['title'])
        self.assertEqual(1, widget_list.get_length())

        widget2_data = {"title": "example2", "body": "example2"}
        widget2_class = "Text"
        widget_list.add_widget(widget2_class, dict(widget2_data), position=0)
        widget2 = WidgetInstance.objects.get(title=widget2_data['title'])
        self.assertEqual(2, widget_list.get_length())

        widgets = widget_list.get_widgets()
        self.assertEqual(widget2.id, widgets[0].id)
        self.assertEqual(widget1.id, widgets[1].id)

    def test_widget_list_remove_widget(self):
        widget_list = WidgetList.objects.create()
        widget1_data = {"title": "example1", "body": "example1"}
        widget1_class = "Text"
        widget_list.add_widget(widget1_class, dict(widget1_data))
        widget1 = WidgetInstance.objects.get(title=widget1_data['title'])

        widget2_data = {"title": "example2", "body": "example2"}
        widget2_class = "Text"
        widget_list.add_widget(widget2_class, dict(widget2_data))
        widget2 = WidgetInstance.objects.get(title=widget2_data['title'])

        widget_list.remove_widget(widget1.id)
        self.assertEqual(1, widget_list.get_length())
        widgets = widget_list.get_widgets()
        self.assertEqual(widget2_data, widgets[0].get_serialized_data())

    def test_widget_list_clear_list(self):
        widget_list = WidgetList.objects.create()
        widget1_data = {"title": "example1", "body": "example1"}
        widget1_class = "Text"
        widget_list.add_widget(widget1_class, dict(widget1_data))
        widget1 = WidgetInstance.objects.get(title=widget1_data['title'])

        widget2_data = {"title": "example2", "body": "example2"}
        widget2_class = "Text"
        widget_list.add_widget(widget2_class, dict(widget2_data))
        widget2 = WidgetInstance.objects.get(title=widget2_data['title'])

        widget3_data = {"title": "example3", "body": "example3"}
        widget3_class = "Text"
        widget_list.add_widget(widget3_class, dict(widget3_data))
        widget3 = WidgetInstance.objects.get(title=widget3_data['title'])

        self.assertEqual(3, widget_list.get_length())
        widget_list.clear_list()
        self.assertEqual(0, widget_list.get_length())
        self.assertEqual(0, WidgetInstance.objects.filter(id=widget1.id).count())
        self.assertEqual(0, WidgetInstance.objects.filter(id=widget2.id).count())
        self.assertEqual(0, WidgetInstance.objects.filter(id=widget3.id).count())
