import {_defaultRenderer, _defaultWidgetWrapper, _defaultListWrapper,
  _defaultFormWrapper, _defaultLoader, _defaultFetchJsonData} from './defaults'

const defaultSettings = {
  /**
   * defaultSettings are the default props attached to a widget-list. Most of these are defined in defaults.js
   *
   * defaultSettings:
   *    disableWidgetFramework: if true, widget lists will not render
   *    fetchData: fetch wrapper to make requests to the widget-framework backend
   *    errorHandler: default behavior when an error is caught after a fetch request
   *    Loader: a component to render while waiting for async data requests
   *    renderers: an object mapping the name of a custom renderer to its component
   *    defaultRenderer: renderer to use when no renderer is specified
   *
   *    ListWrapper: component that will render around the widget-list and call renderWidgetList()
   *    FormWrapper: component that will render around a widget-form and call renderWidgetForm()
   *    WidgetWrapper: component that will render around a widget and call renderWidget()
   *
   */
  FormWrapper: _defaultFormWrapper,
  ListWrapper: _defaultListWrapper,
  Loader: _defaultLoader,
  WidgetWrapper: _defaultWidgetWrapper,
  defaultRenderer: _defaultRenderer,
  disableWidgetFramework: false,
  errorHandler: console.error,
  fetchData: _defaultFetchJsonData,
  renderers: {},
}

function configureWidgetFrameworkSettings(userSettings = {}) {
  /**
   * Allows user to pass in custom settings that override defaults. Must be called and the return values passed into
   *    the widget-list as props:
   *
   *      <WidgetList {...configureWidgetFrameworkSettings(mySettings)}>
   */
  return {
    ...defaultSettings,
    ...userSettings
  }
}

export { defaultSettings, configureWidgetFrameworkSettings }
