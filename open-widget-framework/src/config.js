import {_defaultRenderer, _defaultWidgetWrapper, _defaultListWrapper,
  _defaultFormWrapper, _defaultLoader, _defaultFetchJsonData} from './defaults'

const defaultSettings = {
  FormWrapper: _defaultFormWrapper,
  ListWrapper: _defaultListWrapper,
  defaultRenderer: _defaultRenderer,
  WidgetWrapper: _defaultWidgetWrapper,
  disableWidgetFramework: false,
  errorHandler: console.error,
  fetchData: _defaultFetchJsonData,
  loader: _defaultLoader,
  renderers: {},
}

function configureWidgetFrameworkSettings(userSettings = {}) {
  return {
    ...defaultSettings,
    ...userSettings
  }
}

export { defaultSettings, configureWidgetFrameworkSettings }
