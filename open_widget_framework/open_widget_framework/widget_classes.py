"""
WidgetApp widget classes
"""
from django.contrib.auth.models import User
from django.utils.html import format_html

from open_widget_framework.widget_class_base import WidgetClassBase
from open_widget_framework.react_fields import (
    ReactCharField,
    ReactURLField,
    ReactMultipleChoiceField,
    ReactFileField,
)


class TextWidget(WidgetClassBase):
    """
    A basic text widget

    Fields:
        body: Inner text of the widget

    Renderer: default
    """

    name = "Text"
    body = ReactCharField(props={"placeholder": "Enter widget text"})

    def render(self):
        return format_html("<p>{body}</p>", body=self.data["body"])


class URLWidget(WidgetClassBase):
    """
    A basic url widget

    Fields:
        url: url to use in iframe

    Renderer: default
    """

    name = "URL"
    url = ReactURLField(props={"placeholder": "Enter URL"})

    def render(self):
        return format_html("<iframe src={url}></iframe>", url=self.data["url"])


class ManyUserWidget(WidgetClassBase):
    """
    Choose any number of Django user objects and display some data about them

    Fields:
        users: Django user objects to display

    Renderer: default
    """

    name = "Many User"
    user_ids = ReactMultipleChoiceField([], props={"placeholder": "Select users"})

    def pre_configure(self):
        # Dynamically set users to choose from
        self.fields["user_ids"].choices = [
            (user.id, user.username) for user in User.objects.all().order_by("id")
        ]

    def render(self):
        users = {User.objects.get(id=user_id) for user_id in self.data["user_ids"]}
        select_user_html = (
            "<table><tr><th>Username</th><th>Last Name</th><th>First Name</th><th>Last Logged In</th></tr>"
            + "".join(
                [
                    "<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>"
                    % (u.username, u.last_name, u.first_name, u.last_login)
                    for u in users
                ]
            )
            + "</table>"
        )
        return format_html(select_user_html)


class FileWidget(WidgetClassBase):
    """
    UNIMPLEMENTED
    Upload a file and display a download link

    Fields:
        file:

    Renderer:
    """

    name = "File"
    file = ReactFileField()

    def render(self, request, configuration):
        pass
