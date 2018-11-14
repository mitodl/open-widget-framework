from django.core.exceptions import ImproperlyConfigured
from rest_framework import serializers
from django.db.models import CharField, URLField

from open_widget_framework.react_fields import ReactCharField, ReactURLField, ReactChoiceField
from open_widget_framework.models import WidgetInstance, WidgetList
from open_widget_framework.utils import get_widget_class_dict


def get_widget_class_configurations():
    widget_classes = get_widget_class_dict()
    return {key: WidgetSerializer().get_configuration_form_spec(key) for key in widget_classes.keys()}


def get_widget_class_serializer(widget_class_name):
    """Return the class of serializer that can properly validate and render this widget instance"""
    for (key, widget_class) in get_widget_class_dict().items():
        if key == widget_class_name:
            return widget_class
    else:
        raise ImproperlyConfigured("no widget of type %s found" % widget_class_name)


class WidgetSerializer(serializers.ModelSerializer):

    class Meta:
        model = WidgetInstance
        fields = '__all__'
        form_fields = ('title',)

    def __init__(self, *args, **kwargs):
        self.serializer_field_mapping.update({
            CharField: ReactCharField,
            URLField: ReactURLField,
        })
        self.serializer_choice_field = ReactChoiceField
        super().__init__(*args, **kwargs)

    def validate_configuration(self, value):
        widget_class_serializer = get_widget_class_serializer(self.initial_data['widget_class'])(data=value)
        if widget_class_serializer.is_valid():
            return widget_class_serializer.post_configure()
        else:
            #TODO: better error messaging
            raise serializers.ValidationError('Bad configuration')

    def validate_position(self, value):
        #TODO check for proper positioning
        return value

    def render_with_title(self):
        """
        Runs the class's render function and adds on the title. If the render function returns a string, that string
        will be set to the inner HTML of the default renderer. If it returns a dict, that dict will be passed as a
        configuration to a react_renderer which must be specified.
        """
        base_configuration = self.data
        base_configuration.pop('configuration')

        rendered_body = self.get_widget_serializer().render()
        if isinstance(rendered_body, dict):
            base_configuration.update(rendered_body)
        else:
            base_configuration.update({'html': rendered_body})
        return base_configuration

    def get_form_data(self):
        form_data = self.data['configuration']
        form_data.update({key: self.data[key] for key in self.Meta.form_fields})
        return form_data

    def get_configuration_form_spec(self, widget_class_name):
        """Returns the specifications for the configuration of a widget class"""
        widget_serializer = get_widget_class_serializer(widget_class_name)()
        widget_base_form_spec = [self.fields[key].configure_form_spec() for key in self.Meta.form_fields]
        widget_base_form_spec[0]['props'] = {'placeholder': 'Enter widget title', 'autofocus': True}
        widget_class_form_spec = [widget_serializer.fields[key].configure_form_spec()
                                  for key in widget_serializer.fields]
        return widget_base_form_spec + widget_class_form_spec

    def get_widget_serializer(self):
        widget_class_serializer = get_widget_class_serializer(self.data['widget_class'])
        widget_serializer = widget_class_serializer(data=self.data['configuration'])
        if not widget_serializer.is_valid():
            # TODO: handle error here
            raise Exception
        else:
            return widget_serializer


class WidgetListSerializer(serializers.ModelSerializer):
    class Meta:
        model = WidgetList
        fields = ()
