from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from json import loads

from open_widget_framework.models import WidgetList, WidgetInstance
from open_widget_framework.widget_serializer import WidgetSerializer


def get_post_data(widget_list, widget_class, configuration):
    """ Helper function to construct generic widget data for an arbitrary class and configuration """
    return {
        "widget_class": widget_class,
        "position": 0,
        "title": "example",
        "configuration": configuration,
        "widget_list": widget_list.id,
        "react_renderer": None
    }


class TestWidgetClasses(TestCase):
    """ Tests built in widget classes """

    def test_text_widget(self):
        """ Test POST request to create a text widget """
        widget_list = WidgetList.objects.create()
        widget_data = get_post_data(widget_list, 'Text', {'body': 'example body'})
        url = reverse(
            "widget_view", kwargs={"widget_list_id": widget_list.id, "pk": ""}
        )
        resp = self.client.post(url, data=widget_data, content_type="application/json")
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="POST widget_view returned a bad status: %s" % resp.status_code,
        )
        data = loads(resp.content)
        widget = WidgetInstance.objects.get(widget_list=widget_list)
        widget_data.update({'id': WidgetInstance.objects.get(title=widget_data['title']).id})
        self.assertEqual(
            widget_data,
            WidgetSerializer(widget).data,
            msg="POST widget_view entered bad widget data",
        )
        self.assertEqual(
            WidgetSerializer(widget).render_with_title(),
            data[0],
            msg="POST widget_view returned bad data",
        )

    def test_url_widget(self):
        """ Test POST request to create a url widget """
        widget_list = WidgetList.objects.create()
        widget_data = get_post_data(widget_list, 'URL', {'url': 'https://zagaran.com'})
        url = reverse(
            "widget_view", kwargs={"widget_list_id": widget_list.id, "pk": ""}
        )
        resp = self.client.post(url, data=widget_data, content_type="application/json")
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="POST widget_view returned a bad status: %s" % resp.status_code,
        )
        data = loads(resp.content)
        widget = WidgetInstance.objects.get(widget_list=widget_list)
        widget_data.update({'id': WidgetInstance.objects.get(title=widget_data['title']).id})
        self.assertEqual(
            widget_data,
            WidgetSerializer(widget).data,
            msg="POST widget_view entered bad widget data",
        )
        self.assertEqual(
            WidgetSerializer(widget).render_with_title(),
            data[0],
            msg="POST widget_view returned bad data",
        )

    def test_many_user_widget(self):
        """ Test POST request to create a many user widget """
        widget_list = WidgetList.objects.create()
        user1 = User.objects.create_user('user1')
        User.objects.create_user('user2')
        user3 = User.objects.create_user('user3')
        widget_data = get_post_data(widget_list, 'Many User', {'user_ids': [user1.id, user3.id]})
        url = reverse(
            "widget_view", kwargs={"widget_list_id": widget_list.id, "pk": ""}
        )
        resp = self.client.post(url, data=widget_data, content_type="application/json")
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="POST widget_view returned a bad status: %s" % resp.status_code,
        )
        data = loads(resp.content)
        widget = WidgetInstance.objects.get(widget_list=widget_list)
        widget_data.update({'id': WidgetInstance.objects.get(title=widget_data['title']).id})
        self.assertEqual(
            widget_data,
            WidgetSerializer(widget).data,
            msg="POST widget_view entered bad widget data",
        )
        self.assertEqual(
            WidgetSerializer(widget).render_with_title(),
            data[0],
            msg="POST widget_view returned bad data",
        )
