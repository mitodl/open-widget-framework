from django.core.exceptions import ImproperlyConfigured
from rest_framework import serializers
from django.db.models import CharField

from open_widget_framework.react_fields import ReactCharField, ReactChoiceField
from open_widget_framework.models import WidgetInstance, WidgetList
from open_widget_framework.utils import get_widget_class_dict


def get_widget_class_configurations():
    """
    Get_widget_class_configurations returns a dictionary mapping the names of the widget classes to their configurations
    """
    widget_classes = get_widget_class_dict()
    return {key: WidgetSerializer().get_configuration_form_spec(key) for key in widget_classes.keys()}


def get_widget_class_serializer(widget_class_name):
    """
    Return the class of serializer that can properly validate and render this widget instance
    """
    for (key, widget_class) in get_widget_class_dict().items():
        if key == widget_class_name:
            return widget_class
    else:
        raise ImproperlyConfigured("no widget of type %s found" % widget_class_name)


class WidgetSerializer(serializers.ModelSerializer):
    """
    WidgetSerializer is a model serializer based on the widgetInstance model. It handles validating the widgetInstance
        data by validating it's own data and passing the JSON blob into a widget_class_serializer that validates that
        blob and returns it to be stored in the database
    """
    class Meta:
        """
        form_fields represents all fields that are returned for the frontend widget-form in addition to all the
            configuration fields in the individual widget class.
        """
        model = WidgetInstance
        fields = '__all__'
        form_fields = ('title',)

    def __init__(self, *args, **kwargs):
        """
        In init we are overriding some of the native serializer field mappings with our own react_fields. This allows
            us to use our ReactCharField for title and our ReactChoiceField for the widget class option
        """
        self.serializer_field_mapping.update({
            CharField: ReactCharField,
        })
        self.serializer_choice_field = ReactChoiceField
        super().__init__(*args, **kwargs)

    def validate_configuration(self, value):
        """
        validate_configuration finds the appropriate widget_class_serializer and validated the configuration field of
            the widgetInstance
        """
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
        Runs the class's render function and adds on the title.
            If the render function returns a string, that string will be set html prop of the default renderer.
            If it returns a dict, that dict will be passed as props to a react_renderer which must be specified.
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
        """
        get_form_data returns a flat representation of all the data that is needed to repopulate a form in order to
            edit a widget, namely all the values stored in configuration plus all values that are listed as form_fields
            in the Meta class
        """
        form_data = self.data['configuration']
        form_data.update({key: self.data[key] for key in self.Meta.form_fields})
        return form_data

    @classmethod
    def get_configuration_form_spec(cls, widget_class_name):
        """
        get_configuration_form_spec returns configurations for a specific widget_class
        :param widget_class_name: widget_class to get configuration for
        :return: a list of dicts that represent the input fields in a form that the frontend will render
        """
        widget_serializer = get_widget_class_serializer(widget_class_name)()
        widget_base_form_spec = [cls().fields[key].configure_form_spec() for key in cls.Meta.form_fields]
        widget_base_form_spec[0]['props'] = {'placeholder': 'Enter widget title', 'autoFocus': True}
        widget_class_form_spec = [widget_serializer.fields[key].configure_form_spec()
                                  for key in widget_serializer.fields]
        return widget_base_form_spec + widget_class_form_spec

    def get_widget_serializer(self):
        """
        Finds the appropriate widget_class serializer for it's own widget class and validates it's JSON blob
        """
        widget_class_serializer = get_widget_class_serializer(self.data['widget_class'])
        widget_serializer = widget_class_serializer(data=self.data['configuration'])
        if not widget_serializer.is_valid():
            # TODO: handle error here
            raise Exception
        else:
            return widget_serializer


class WidgetListSerializer(serializers.ModelSerializer):
    """
    A very simple serializer that allows us to use DRF ModelViewSets to create and destroy widget-lists in views.py
    """
    class Meta:
        model = WidgetList
        fields = ()
