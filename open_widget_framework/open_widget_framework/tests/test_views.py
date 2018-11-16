from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from json import loads

from open_widget_framework.models import WidgetList, WidgetInstance
from open_widget_framework.widget_serializer import WidgetSerializer
from open_widget_framework.utils import get_widget_class_dict


def add_widget(widget_list, index=1):
    """ Helper function that creates an example text widget with a certain index on a specified widget list """
    WidgetInstance.objects.create(
        widget_list=widget_list,
        title='widget%s' % index,
        position=widget_list.get_length(),
        widget_class='Text',
        configuration={'body': 'example%s' % index}
    )


class TestViews(TestCase):
    """ Tests views """

    def test_get_widget_lists(self):
        """ Test get_lists api endpoint """
        url = reverse("get_lists")
        resp = self.client.get(url)
        self.assertEqual(
            resp.status_code, status.HTTP_200_OK, msg="get_lists returned a bad status"
        )
        self.assertEqual(
            resp.content, b"[]", msg="get_lists returned bad data when list was empty"
        )

    def test_get_widget_configurations(self):
        """ Test get_configurations api endpoint """
        url = reverse("get_configurations")
        resp = self.client.get(url)
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="get_configurations returned a bad status: %s" % resp.status_code,
        )
        data = loads(resp.content)
        self.assertEqual(
            data["widgetClassConfigurations"].keys(),
            get_widget_class_dict().keys(),
            msg="get_configurations returned bad widget class data",
        )

    def test_get_widget_list(self):
        """ Test GET widget_list_view api endpoint """
        widget_list = WidgetList.objects.create()
        url = reverse("widget_list_view", kwargs={"pk": widget_list.id})
        resp = self.client.get(url)
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="GET widget_list_view returned a bad status: %s" % resp.status_code,
        )
        self.assertEqual(
            resp.content,
            b"[]",
            msg="GET widget_list_view returned bad data when widget list was empty",
        )

    def test_404_get_widget_list(self):
        """ Test GET widget_list_view for a bad widget list """
        widget_list = WidgetList.objects.create()
        url = reverse("widget_list_view", kwargs={"pk": widget_list.id + 1})
        resp = self.client.get(url)
        self.assertEqual(
            resp.status_code,
            status.HTTP_404_NOT_FOUND,
            msg="GET widget_list_view returned a bad status: %s" % resp.status_code,
        )

    def test_post_widget_list(self):
        """ Test POST widget_list_view api endpoint """
        url = reverse("widget_list_view", kwargs={"pk": ""})
        resp = self.client.post(url, content_type="application/json")
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="POST widget_list_view returned a bad status: %s" % resp.status_code,
        )
        data = loads(resp.content)
        self.assertEqual(
            1,
            len(data),
            msg="POST widget_list_view should have returned 1 widget list but instead returned %s"
            % len(data),
        )
        self.assertEqual(
            1,
            len(WidgetList.objects.filter(id=data[0])),
            msg="POST widget_list_view returned a bad widget list: %s" % data[0],
        )

    def test_delete_widget_list(self):
        """ Test DELETE widget_list_view api endpoint """
        widget_list = WidgetList.objects.create()
        url = reverse("widget_list_view", kwargs={"pk": widget_list.id})
        resp = self.client.delete(url, content_type="application/json")
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="DELETE widget_list_view returned a bad status: %s" % resp.status_code,
        )
        self.assertEqual(
            resp.content, b"[]", msg="DELETE widget_list_view returned bad data"
        )
        self.assertEqual(
            0,
            len(WidgetList.objects.filter(id=widget_list.id)),
            msg="DELETE widget_list_view did not delete widget list",
        )

    def test_get_widget(self):
        """ Test GET widget_view api endpoint """
        widget_list = WidgetList.objects.create()
        add_widget(widget_list)
        widget = WidgetInstance.objects.get(widget_list=widget_list)
        url = reverse(
            "widget_view",
            kwargs={"widget_list_id": widget_list.id, "pk": widget.id},
        )
        resp = self.client.get(url)
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="GET widget_view returned a bad status: %s" % resp.status_code,
        )
        data = loads(resp.content)
        self.assertEqual(
            {'body': 'example1', 'title': 'widget1'},
            data["widgetData"],
            msg="GET widget_view returned bad widget_data",
        )
        self.assertEqual(
            1,
            len(data["widgetClassConfigurations"].keys()),
            msg="GET widget_view returned bad number of widget class configurations",
        )
        self.assertEqual(
            "Text",
            list(data["widgetClassConfigurations"].keys())[0],
            msg="GET widget_view returned bad widget_configuration",
        )

    def test_404_get_widget(self):
        """ Test GET widget_view for a bad widget id """
        widget_list = WidgetList.objects.create()
        add_widget(widget_list)
        widget = WidgetInstance.objects.get(widget_list=widget_list)
        url = reverse(
            "widget_view",
            kwargs={"widget_list_id": widget_list.id, "pk": widget.id + 1},
        )
        resp = self.client.get(url)
        self.assertEqual(
            resp.status_code,
            status.HTTP_404_NOT_FOUND,
            msg="GET widget_view returned a bad status: %s" % resp.status_code,
        )

    def test_post_widget(self):
        """ Test POST widget_view api endpoint """
        widget_list = WidgetList.objects.create()
        widget_class = "Text"
        widget_data = {
            "widget_class": widget_class,
            "position": 0,
            "title": "example",
            "configuration": {"body": "example"},
            "widget_list": widget_list.id,
            "react_renderer": None
        }
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
        self.assertEqual(
            1,
            len(data),
            msg="POST widget_view returned the wrong number of widget instances",
        )
        self.assertEqual(
            1,
            len(WidgetInstance.objects.filter(widget_list=widget_list)),
            msg="POST widget_view did not create the widget instance properly",
        )
        widget = WidgetInstance.objects.get(widget_list=widget_list)
        self.assertEqual(
            widget.id,
            data[0]["id"],
            msg="POST widget_view did not return the correct widget instance",
        )
        self.assertEqual(
            widget_class,
            widget.widget_class,
            msg="POST widget_view created the wrong class widget",
        )
        widget_data.update({'id': WidgetInstance.objects.get(title=widget_data['title']).id})
        self.assertEqual(
            widget_data,
            WidgetSerializer(widget).data,
            msg="POST widget_view created widget with bad data",
        )
        self.assertEqual(
            WidgetSerializer(widget).render_with_title(),
            data[0],
            msg="POST widget_view returned bad data",
        )

    def test_delete_widget(self):
        """ Test DELETE widget_view api endpoint """
        widget_list = WidgetList.objects.create()
        add_widget(widget_list)
        widget = WidgetInstance.objects.get(widget_list=widget_list)
        url = reverse(
            "widget_view",
            kwargs={"widget_list_id": widget_list.id, "pk": widget.id},
        )
        resp = self.client.delete(url, content_type="application/json")
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="DELETE widget_view returned a bad status: %s" % resp.status_code,
        )
        self.assertEqual(
            resp.content, b"[]", msg="DELETE widget_view returned bad data"
        )
        self.assertEqual(
            0,
            len(WidgetInstance.objects.filter(id=widget.id)),
            msg="DELETE widget_view did not delete widget",
        )

    def test_edit_widget(self):
        """ Test PUT widget_view api endpoint """
        widget_list = WidgetList.objects.create()
        add_widget(widget_list)
        widget = WidgetInstance.objects.get(widget_list=widget_list)

        new_widget_data = {
            "widget_class": "Text",
            "title": "new_title",
            "configuration": {"body": "new_body"},
        }
        url = reverse(
            "widget_view",
            kwargs={"widget_list_id": widget_list.id, "pk": widget.id},
        )
        resp = self.client.patch(
            url, data=new_widget_data, content_type="application/json"
        )
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="PUT widget_view returned a bad status: %s" % resp.status_code,
        )
        data = loads(resp.content)
        self.assertEqual(
            1,
            len(data),
            msg="PUT widget_view returned the wrong number of widget instances",
        )
        self.assertEqual(
            1,
            len(WidgetInstance.objects.filter(widget_list=widget_list)),
            msg="PUT widget_view altered the length of the widget list",
        )
        self.assertEqual(
            1,
            len(WidgetInstance.objects.filter(id=widget.id)),
            msg="PUT widget_view altered widget id",
        )
        widget = WidgetInstance.objects.get(id=widget.id)
        self.assertEqual(
            "Text",
            widget.widget_class,
            msg="PUT widget_view changed widget class",
        )
        self.assertEqual(
            new_widget_data['title'],
            widget.title,
            msg="PUT widget_view did not properly change widget title",
        )
        self.assertEqual(
            new_widget_data['configuration'],
            widget.configuration,
            msg="PUT widget_view did not properly change widget configuration",
        )

    def test_reposition_widget(self):
        """ Test PATCH widget_view api endpoint """
        widget_list = WidgetList.objects.create()
        add_widget(widget_list, index=1)
        widget1 = WidgetInstance.objects.get(title="widget1")

        add_widget(widget_list, index=2)
        widget2 = WidgetInstance.objects.get(title="widget2")

        add_widget(widget_list, index=3)
        widget3 = WidgetInstance.objects.get(title="widget3")

        url = (
            reverse(
                "widget_view",
                kwargs={"widget_list_id": widget_list.id, "pk": widget3.id},
            )
        )
        resp = self.client.patch(url, data={'position': 0}, content_type="application/json")
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="PATCH widget_view returned a bad status: %s" % resp.status_code,
        )
        data = loads(resp.content)
        data.sort(key=lambda x: x["position"])
        self.assertEqual(
            widget3.id,
            data[0]["id"],
            msg="PATCH widget_view did not move widget 3 to the first position",
        )
        self.assertEqual(
            widget1.id,
            data[1]["id"],
            msg="PATCH widget_view did not shift widget 1 forward",
        )
        self.assertEqual(
            widget2.id,
            data[2]["id"],
            msg="PATCH widget_view did not shift widget 2 forward",
        )

        url = (
            reverse(
                "widget_view",
                kwargs={"widget_list_id": widget_list.id, "pk": widget3.id},
            )
        )
        resp = self.client.patch(url, data={"position": 2}, content_type="application/json")
        self.assertEqual(
            resp.status_code,
            status.HTTP_200_OK,
            msg="PATCH widget_view returned a bad status: %s" % resp.status_code,
        )
        data = loads(resp.content)
        data.sort(key=lambda x: x["position"])
        self.assertEqual(
            widget1.id,
            data[0]["id"],
            msg="PATCH widget_view did not shift widget 1 backward",
        )
        self.assertEqual(
            widget2.id,
            data[1]["id"],
            msg="PATCH widget_view did not shift widget 2 backward",
        )
        self.assertEqual(
            widget3.id,
            data[2]["id"],
            msg="PATCH widget_view did not move widget 3 to the last position",
        )

    def test_patch_widget_out_of_bounds(self):
        """ Test PATCH widget_view with widget positions out of bounds """
        widget_list = WidgetList.objects.create()

        add_widget(widget_list, index=1)
        widget1 = WidgetInstance.objects.get(title="widget1")

        add_widget(widget_list, index=2)
        widget2 = WidgetInstance.objects.get(title="widget2")

        add_widget(widget_list, index=3)
        widget3 = WidgetInstance.objects.get(title="widget3")

        url = reverse("widget_view",
                      kwargs={"widget_list_id": widget_list.id, "pk": widget3.id})
        resp = self.client.patch(url, data={"position": -100}, content_type="application/json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST,
                         msg='PATCH widget_view returned a bad status: %s' % resp.status_code)

        url = reverse("widget_view",
                      kwargs={"widget_list_id": widget_list.id, "pk": widget3.id})
        resp = self.client.patch(url, data={"position": 100}, content_type="application/json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST,
                         msg='PATCH widget_view returned a bad status: %s' % resp.status_code)

        url = reverse("widget_view",
                      kwargs={"widget_list_id": widget_list.id, "pk": widget3.id})
        resp = self.client.patch(url, data={"position": 2}, content_type="application/json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK,
                         msg='PATCH widget_view returned a bad status: %s' % resp.status_code)
        data = loads(resp.content)
        data.sort(key=lambda x: x['position'])
        self.assertEqual(widget1.id, data[0]['id'], msg="PATCH widget_view moved widget1 unnecessarily")
        self.assertEqual(widget2.id, data[1]['id'], msg="PATCH widget_view moved widget2 unnecessarily")
        self.assertEqual(widget3.id, data[2]['id'], msg="PATCH widget_view moved widget3 unnecessarily")
