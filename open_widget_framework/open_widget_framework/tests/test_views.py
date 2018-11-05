from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from hypothesis.extra.django.models import models

from open_widget_framework.models import WidgetList, WidgetInstance


class TestViews(TestCase):
    """ Tests views """

    def test_get_widget_lists(self):
        url = reverse("get_lists")
        resp = self.client.get(url, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_get_widget_lists(self):
        widget_list_example = models(WidgetList).example()
        url = reverse("widget_list_view", kwargs={"widget_list_id": widget_list_example.id})
        resp = self.client.get(url, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)