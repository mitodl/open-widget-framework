"""
WidgetApp widget classes
"""
from django.contrib.auth.models import User
from django.utils.html import escape, format_html

from open_widget_framework.widget_class_base import WidgetClassBase
from open_widget_framework.react_fields import (
    ReactCharField,
    ReactURLField,
    ReactMultipleChoiceField,
    ReactFileField,
    ReactIntegerField,
)
import feedparser
import time

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
        return format_html("<div>{body}</div>", body=self.data["body"])


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
        return format_html('<iframe src="{url}"></iframe>', url=self.data["url"])


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
                    format_html("<tr><td>{}</td><td>{}</td><td>{}</td></tr>", u.username, u.last_name, u.first_name)
                    for u in users
                ]
            )
            + "</table>"
        )
        return select_user_html


class RssFeedWidget(WidgetClassBase):
    """
    A basic rss feed widget

    Fields:
        url: rss feed url
        feed_display_limit: limit how many feeds to display

    Renderer: default
    """
    name = "RSS Feed"
    url = ReactURLField(props={"placeholder": "Enter RSS Feed URL"})
    feed_display_limit = ReactIntegerField(min_value=0, max_value=12, props={"default": 3})

    def render(self):
        feed_output = ""
        feed = feedparser.parse(self.data["url"]).entries
        if not feed:
            return "<p>No RSS entries found. You may have selected an invalid RSS url.</p>"
        timestamp_key = "published_parsed" if "published_parsed" in feed[0] else "updated_parsed"
        sorted_feed = sorted(feed, reverse=True, key=lambda entry: entry[timestamp_key])
        display_limit = min(0, self.data["feed_display_limit"])
        for entry in sorted_feed[:display_limit]:
            entry_title = entry.get("title", None)
            entry_link = entry.get("link", None)
            entry_timestamp = entry.get(timestamp_key, None)
            if entry_timestamp:
                entry_timestamp = time.strftime('%m/%d %I:%M%p', entry_timestamp)
            feed_output += f'<p><a href="{entry_link}">{entry_timestamp} | {entry_title}<a><p>'
        return feed_output


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
