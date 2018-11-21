from rest_framework import serializers


class WidgetClassBase(serializers.Serializer):
    """
    WidgetClassBase is the base class for a widget class. It should be extended to properly serialize a widget
        configuration json blob. It must implement a render method and has stubs for pre and post configuring data
    """
    def __init__(self, *args, **kwargs):
        self.pre_configure()
        super().__init__(*args, **kwargs)

    def render(self):
        """
        render(): This method MUST be implemented in every widget class. It can return either a string of a dictionary:
            If render returns a string, the string must be formatted html. It will be assigned to a prop called html and
                passed into the frontend renderer component
            If render returns a dict, the elements of the dict will be treated like props and passed into the renderer
                in the frontend. You will want to define a custom renderer to handle these props appropriately as the
                default renderer only know what to do with the html and title props
        """
        raise NotImplementedError

    def pre_configure(self):
        """pre_configure(): This method may be implemented in a widget class. It runs whenever the widget class
            serializer is initialized. It can be used to dynamically load content that comes from the database (such as
            a list of users to use a choices in a selector for example). It does not return any value.
        """
        # Can be overridden by child class
        pass

    def post_configure(self):
        """post_configure(): This is the last chance to manipulate the data before it is passed into the database.
            The return value is passed into the widgetInstance as a JSON blob and stored in the database.

            **NOTE: it returns the initial_data and not the validated data not because the data is not guaranteed
            to be valid, but rather because the MultipleChoiceField validates to a set which is not serializable.
            The initial data should only be manipulated in this function, so if you override it, ensure that the return
            value is entirely serializable
        """
        # Can be overridden by child class
        return self.initial_data
