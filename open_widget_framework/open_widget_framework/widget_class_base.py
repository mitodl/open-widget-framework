from rest_framework import serializers


class WidgetClassBase(serializers.Serializer):
    """
    WidgetClassBase is the base serializer for a a widget instance. It handles configuration for fields that all widgets have:
        - react_renderer (default: DefaultRenderer
        - title

    A widget class must extend WidgetClassBase, specify a name, and implement render method that DOES NOT handle the widget
        title. The extended class can also implement pre-configure and post-configure to further manage the
        widget rendering. Widget classes should specify input fields using the React input fields in react_fields
        in order to get proper form generation on the frontend
    """
    def __init__(self, *args, **kwargs):
        self.pre_configure()
        super().__init__(*args, **kwargs)

    def render(self):
        """Must be implemented in the subclass"""
        raise NotImplementedError

    def pre_configure(self):
        """Pre configure can be used to dynamically load configuration settings at reference / validation time"""
        # Can be overridden by child class
        pass

    def post_configure(self):
        """Configure widget data after serializer instantiation"""
        # Can be overridden by child class
        return self.initial_data
