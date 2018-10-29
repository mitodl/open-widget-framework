"""
WidgetApp widget classes
"""
from django.contrib.auth.models import User
from django.utils.html import format_html
from rest_framework import serializers

from open_widget_framework.react_fields import ReactCharField, ReactURLField, ReactMultipleChoiceField, ReactFileField

from open_widget_framework.open_widget_framework.default_settings import get_widget_classes

#TODO: move widgetbase to its own file
#TODO: Add make_widget method to widget_base

class WidgetBase(serializers.Serializer):
    """
    WidgetBase is the base serializer for a a widget instance. It handles configuration for fields that all widgets have:
        - react_renderer (default: DefaultRenderer
        - title

    A widget class must extend WidgetBase, specify a name, and implement render method that DOES NOT handle the widget
        title. The extended class can also implement pre-configure and post-configure to further manage the
        widget rendering. Widget classes should specify input fields using the React input fields in react_fields
        in order to get proper form generation on the frontend
    """
    name = None
    react_renderer = 'DefaultRenderer'
    title = ReactCharField(max_length=200, props={'placeholder': 'Enter widget title', 'autoFocus': True})

    def __init__(self, **kwargs):
        self.pre_configure()
        super().__init__(**kwargs)

    def render(self, request, configuration):
        """Must be implemented in the subclass"""
        raise NotImplementedError

    def pre_configure(self):
        """Pre configure can be used to dynamically load configuration settings at reference / validation time"""
        # Can be overridden by child class
        pass

    def post_configure(self):
        """Configure widget data after serializer instantiation"""
        # Can be overridden by child class
        pass

    def render_with_title(self, request, widget_instance):
        """
        Runs the class's render function and adds on the title. If the render function returns a string, that string
        will be set to the inner HTML of the default renderer. If it returns a dict, that dict will be passed as a
        configuration to a react_renderer which must be specified.
        """
        self.post_configure()
        rendered_body = self.render(request, widget_instance['configuration'])
        if isinstance(rendered_body, dict):
            rendered_body.update({'title': widget_instance['title'],
                                  'position': widget_instance['position'],
                                  'reactRenderer': self.react_renderer})
            return rendered_body
        else:
            return {
                'title': widget_instance['title'],
                'position': widget_instance['position'],
                'html': rendered_body,
                'reactRenderer': self.react_renderer,
            }

    def get_configuration_form_spec(self):
        """Returns the specifications for the configuration of a widget class"""
        configuration = [self.fields[key].configure_form_spec() for key in self.fields]
        return configuration


class TextWidget(WidgetBase):
    """
    A basic text widget

    Fields:
        body: Inner text of the widget

    Renderer: default
    """
    name = 'Text'
    body = ReactCharField(props={'placeholder': 'Enter widget text'})

    def render(self, request, configuration):
        return format_html("<p>{body}</p>", body=configuration['body'])


class URLWidget(WidgetBase):
    """
    A basic url widget

    Fields:
        url: url to use in iframe

    Renderer: default
    """
    name = 'URL'
    url = ReactURLField(props={'placeholder': 'Enter URL'})

    def render(self, request, configuration):
        return format_html('<iframe src={url}></iframe>', url=configuration['url'])


class ManyUserWidget(WidgetBase):
    """
    Choose any number of Django user objects and display some data about them

    Fields:
        users: Django user objects to display

    Renderer: default
    """
    name = 'Many User'
    user_ids = ReactMultipleChoiceField([], props={'placeholder': 'Select users'})

    def pre_configure(self):
        # Dynamically set users to choose from
        self.fields['user_ids'].choices = [(user.id, user.username) for user in User.objects.all()]

    def render(self, request, configuration):
        users = {User.objects.get(id=user_id) for user_id in configuration['user_ids']}
        select_user_html = '<table><tr><th>Username</th><th>Last Name</th><th>First Name</th><th>Last Logged In</th></tr>' \
                           + ''.join(['<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' %
                                      (u.username, u.last_name, u.first_name, u.last_login) for u in users]) + '</table>'
        return format_html(select_user_html)


class FileWidget(WidgetBase):
    """
    UNIMPLEMENTED
    Upload a file and display a download link

    Fields:
        file:

    Renderer:
    """
    name = 'File'
    file = ReactFileField()

    def render(self, request, configuration):
        pass

#TODO: Move to default settings file
def get_widget_class_dict():
    """Return a dictionary of all widget classes referenced by their 'name' fields"""
    return get_widget_classes()

    return {
        'Text': TextWidget,
        'URL': URLWidget,
        # 'One User': OneUserWidget,
        'Many Users': ManyUserWidget,
        # 'File': FileWidget,
    }

#TODO: Move to class method on base
def get_widget_class_configurations():
    """Return a dictionary of widget class configurations references by their name field"""
    widget_class_dict = get_widget_class_dict()
    return {key: value().get_configuration_form_spec() for (key, value) in widget_class_dict.items()}