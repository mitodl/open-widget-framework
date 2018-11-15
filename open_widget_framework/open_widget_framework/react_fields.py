"""
WidgetApp DRF Serializer Field Extensions
"""
from rest_framework import serializers


class ReactField(serializers.Field):
    """
    ReactField is a base extension of the serializer field for use with the widget framework. Any additional React
    serializer fields should utilize multiple inheritance and inherit first from their standard serializer counterpart
    and second from ReactField and implement __init__ and configure_from_spec
    """

    def __init__(self, **kwargs):
        """Strip react significant props and handle them"""
        self.key = None
        self.input_type = kwargs.pop("input_type", "text")
        self.props = kwargs.pop("props", {})

        super().__init__(**kwargs)

    def bind(self, field_name, parent):
        """Bind field_name as a unique key so that react is happy"""
        self.key = field_name
        super().bind(field_name, parent)

    def configure_form_spec(self):
        """Return react-significant fields as a dict"""
        return {
            "key": self.key,
            "label": self.label,
            "inputType": self.input_type,
            "props": self.props,
        }

    @staticmethod
    def serialize(value):
        """Serialize data in the field for the configuration JSONField on the widget"""
        return value

    @staticmethod
    def make_choices_dict(choices):
        """Force choices into a format that react-select component prefers"""
        if choices and isinstance(choices, list) and not isinstance(choices[0], tuple):
            choices = list(enumerate(choices))

        return choices


class ReactCharField(serializers.CharField, ReactField):
    """ReactField extension of DRF CharField"""

    def __init__(self, **kwargs):
        max_length = kwargs.pop("max_length", None)
        if max_length and max_length <= 200:
            input_type = "text"
        else:
            input_type = "textarea"
        super().__init__(max_length=max_length, input_type=input_type, **kwargs)

    def configure_form_spec(self):
        configuration = super().configure_form_spec()
        configuration["props"].update(
            {
                "maxLength": "" if self.max_length is None else self.max_length,
                "minLength": "" if self.min_length is None else self.min_length,
            }
        )
        return configuration


class ReactURLField(serializers.URLField, ReactField):
    """ReactField extension of DRF UrlField"""

    def configure_form_spec(self):
        configuration = super().configure_form_spec()
        configuration["props"].update(
            {
                "maxLength": "" if self.max_length is None else self.max_length,
                "minLength": "" if self.min_length is None else self.min_length,
            }
        )
        return configuration


class ReactChoiceField(serializers.ChoiceField, ReactField):
    """ReactField extension of DRF ChoiceField"""

    def __init__(self, choices, **kwargs):
        super().__init__(self.make_choices_dict(choices), input_type="select", **kwargs)

        # Force multiple to be false so people can't break things. Use ReactMultipleChoiceField to choose multiple
        self.props["isMulti"] = False

    def configure_form_spec(self):
        configuration = super().configure_form_spec()
        configuration.update({"choices": self.choices})
        return configuration


class ReactMultipleChoiceField(serializers.MultipleChoiceField, ReactField):
    """ReactField extension of DRF MultipleChoiceField"""

    def __init__(self, choices, **kwargs):
        super().__init__(self.make_choices_dict(choices), input_type="select", **kwargs)
        # Force multiple for select multiple
        self.props["isMulti"] = True

    def configure_form_spec(self):
        configuration = super().configure_form_spec()
        configuration.update({"choices": self.choices})
        return configuration

    def to_internal_value(self, data):
        return list(super().to_internal_value(data))

    @staticmethod
    def serialize(value):
        return list(value)


class ReactFileField(serializers.FileField, ReactField):
    """ReactField extension of DRF FileField"""

    def __init__(self, **kwargs):
        super().__init__(input_type="file", **kwargs)
