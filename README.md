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
To configure the django app, add `"open_widget_framework"` to the installed apps in your django `settings.py`

If you have self-defined widget classes, they can be added to settings as 
```python
WIDGET_CLASSES = [
    'import.path.to.WidgetClass',
    ...
]
```

You can define a custom authentication backend class as well: 
```python
WIDGET_FRAMEWORK_AUTHENTICATION_BACKEND = MyAuthenticationClass
``` 

### React
To incorporate widgets into your frontend, you have to configure some settings. Import the following configuration function:

```javascript
import configureWidgetFrameworkSettings from '@zagaran/open-widget-framework/es/config'
```

and run it somewhere in your frontend. You can pass in a partial or full object of user settings to define your own defaults:

```javascript
configureWidgetFrameworkSettings({
  mySetting: mySettingValue,
  ...
})
```

The settings that you can currently customize are:
#### `disableWidgetFramework:`
If set to true, WidgetLists will not render on any page

#### `siteBaseUrl:` 
The url base for your app so that the frontend can make fetch requests to the backend. Defaults to `https://localhost:8000/`

#### `csrfToken:` 
The django generated cross site request forgery token that can be passed in through the template. If this isn't defined, you will not be able to create, adit, or delete widgets. For more, see the django documentation:  https://docs.djangoproject.com/en/2.1/ref/csrf/

#### `renderers:`
An object that maps names of custom renderers to their corresponding react components. The name should match the `react_renderer` field on the widget class defined in your custom classes. See the section below on react renderers

#### `errorHandler:`
A function that takes an error message and does something with it. Use this to define your own error handling. Defaults to `console.error`

#### `loader:` 
A component that displays when data is being fetched. Note that this is not a class. It is an instance of a class.

#### `defaultRenderer:`
This setting defines what renderer is used in the default case. Note that unless otherwise specified in the class, widget's will only have two props available to the renderer: title and innerHtml 

#### `defaultWrappers`

`defaultFormWrapper:`

`defaultListWrapper:`

`defaultWidgetWrapper:`

These three settings are react components that wrap the various types of components included in this package. This allows for customization of each individual part of the framework. See the section later about wrappers.

### Using the components
To include a widget list on the page, simply import the widget list component:
```javascript
import WidgetList from '@zagaran/open-widget-framework/es/widget-list`
```
and then include the component in your app, specifying which widget list to include by it's id. Make sure that you have a widget list in the database before you do so.
```javascript
<WidgetList widgetListId={id}/>
```

### Creating your own widgets

#### Defining a widget class
```
class myWidget(WidgetBase):
    name = 'MyWidget'
    myWidgetField = ReactCharField(props={'placeholder': 'This is my widget's only field!})

    def render(self, request, configuration):
        return {'myWidgetField': configuration['myWidgetField']}
```
#### Defining a renderer
```javascript
class myRenderer extends Component {
  render() {
    return (
      <div>
        <h3>{this.props.title}</h3>
        <div dangerouslySetInnerHTML={{__html: this.props.html}}/>
      </div>
  }
}

renderers: {
  myRenderer: myRenderer
}
```
