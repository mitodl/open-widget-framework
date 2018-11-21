[![Build Status](https://travis-ci.org/mitodl/open-widget-framework.svg?branch=master)](https://travis-ci.org/mitodl/open-widget-framework)

# open-widget-framework
A django + react library for managing user-configurable widgets

This repository contains two packages (a pip package and a npm module).

## Installation
pip install the `open_widget_framework` django package:
```bash
pip install open-widget-framework
```  

npm install the `@zagaran/open-widget-framework` npm module: 
```bash
npm install @zagaran/open-widget-framework
```  

## Configuration

### Django
To configure the django app, add `"open_widget_framework"` to the `INSTALLED_APPS` in your django `settings.py`

If you have self-defined widget classes, they can be added to settings as 
```python
WIDGET_CLASSES = [
    'import.path.to.WidgetClass',
    ...
]
```

You can define a custom authentication and permission classes as well: 
```python
WIDGET_FRAMEWORK_AUTHENTICATION_CLASSES = (MyAuthenticationClass,)
WIDGET_FRAMEWORK_PERMISSION_CLASSES = (MyPermissionClass,)
WIDGET_LIST_EDIT_PERMISSIONS = ['my-permission-class']
``` 
The authentication and permission classes control who can view which widget-lists while the WIDGET_LIST_EDIT_PERMISSIONS
is a list of object level permissions that a user must have to make changes to a widget list. By default these are all 
set to None so that anyone can view and change anything, but an easy way to restrict widget edit power would be to 
change WIDGET_LSIT_EDIT_PERMISSIONS to ['change_widgetlist'], which would allow only users with the permission to change
a widget list change that list. That permissions can be added with 
```
user.add_obj_perm('change_widgetlist', WidgetList.objecst.get(id=id_of_widget_list))
```

### React
To include a widget list on the page, simply import the widget list component:
```javascript
import WidgetList from '@zagaran/open-widget-framework/es/widget-list'
```
and then include the component in your app, specifying which widget list to include by its id. Make sure that you have a widget list in the database before you do so.
```javascript
<WidgetList widgetListId={id}/>
```

#### Configuring a widget list
You may want ot customize your widget list further. There are a number of settings that can be configured. The easy way 
to override the default settings is with the configureWidgetFrameworkSettings function from config.js:

```javascript
import configureWidgetFrameworkSettings from '@zagaran/open-widget-framework/es/config'
```

to override the defaultSettings, simply pass your userSettings in as props on the widgetList:

```javascript
const mySettings = {
  mySetting: mySettingValue,
  ...
}

<WidgetList widgetListId={id} ...mySettings/>
```

The settings that you can currently customize are:
#### `disableWidgetFramework: False`
If set to true, WidgetLists will not render on any page

#### `renderers: []`
An object that maps names of custom renderers to their corresponding react components. The name should match the `react_renderer` field on the widget class defined in your custom classes. See the section below on react renderers

#### `fetchData: _defaultFetchJsonData` 
A custom fetch function that takes a url and an object of options similar to fetch. Use this to handle csrf validation and json loading. The 
default fetch wrapper looks for a csrfToken on the window and handles deserializing json

#### `errorHandler: console.error`
A function that takes an error message and does something with it. Use this to define your own error handling. Defaults to `console.error`

#### `loader: _defaultLoader` 
A component that displays when data is being fetched.

#### `defaultRenderer: _defaultRenderer`
This setting defines what renderer is used in the default case. Note that unless otherwise specified in the class, widget's will only have two props available to the renderer: title and hHtml 

#### `Wrappers`

`ListWrapper: _defaultListWrapper`

`FormWrapper: _defaultFormWrapper`

`WidgetWrapper: _defaultWidgetWrapper`

These three settings are react components that wrap the various types of components included in this package. This allows for customization of each individual part of the framework. See the section later about wrappers.

#### `wrapperProps`

`listWrapperProps: null`

`formormWrapperProps: null`

`widgetWrapperProps: null`

These three settings are prop objects that are passed to their respective wrappers. Use these to further customize your wrapper with information, components, and functions from your app

### Creating your own widgets

#### Defining a widget class
When defining a widget class, simply extend WidgetClassBase and define ReactFields from react_fields.py on it. These
fields allow you to configure props for the widget-form (like placeholder in the below example).

All widget classes must implement the render function and return either a string of html (WidgetSerializer runs format_html on it) or 
a dictionary (as in the below example) which will be used as props on the renderer. The default renderer provided with the app only handles title and html props,
but you can change the default renderer.
```python
from open_widget_framework.widget_class_base import WidgetClassBase
from open_widget_framework.react_fields improt ReactCharField, ReactChoice


class MyWidget(WidgetClassBase):
    name = 'MyWidgetClass'
    react_renderer = 'myRenderer'
    myTextField = ReactCharField(props={'placeholder': "This is my widget's text field!"})
    myClassField = ReactCharField(props={'placeholder': "This is my widget's class field!"})
    myChoiceField = ReactChoiceField([], props={'placeholder': "Choose one!"})

    def render(self):
        # render can return a string of html or a dictionary of props to set on a custom renderer
        return self.data
        
    def pre_configure(self):
        # pre_configure allows us to dynamically configure a field, in this case to load options from the db
        self.fields['myChoiceField'].choices = [user.username for user in User.objects.all()]
        
    def post_configure(self):
    # post_configure allows us to manipulate data right before it enters the database
        escaped_data = {
            myTextField: format_html(self.initial_data['myTextField'])
            myClassField: format_html(self.initial_data['myClassField'])
            myChoiceField: format_html(self.initial_data['myChoiceField'])
        return escaped_data
```

Add you widget class in your settings.py:
```python
WIDGET_FRAMEWORK = {
    WIDGET_CLASSES: [
        'path.to.myWidget'
    ]
}
```
#### Defining a renderer
A custom renderer is just a React component that will receive the rendered props, either title and html or a custom set of props 
defined in the widget class render function.
```javascript
class myRenderer extends Component {
  render() {
    return (
      <div>
        <h3>{this.props.title}</h3>
        <div className={this.props.myClassField}>{this.props.myTextField}</div>
        <div>You chose {this.props.myChoiceField}</div>
      </div>
  }
}
```
Add your renderer as a prop in WidgetList:

```javascript
<WidgetList widgetListId={id} renderers={myRenderer: myRenderer}/>
```
### Database
The `open_widget_framework` django package makes use of PostgreSQL>=9.4 and `django.contrib.postgres.fields.JSONField` to store JSON content.

## Running Tests
For the `open_widget_framework` django package, the following will use the Django's built-in test runner to discover tests:
```bash
python runtests.py
```
To obtain a coverage report (include omit flag as needed):  
```bash
coverage run runtests.py; coverage report -m [--omit="*/.virtualenv/*"]
```
