import {_defaultRenderer, _defaultWidgetWrapper, _defaultListWrapper,
  _defaultFormWrapper, _defaultLoader, _defaultFetchJsonData} from './defaults'

export const defaultSettings = {
  csrfToken: '',
  formWrapper: _defaultFormWrapper,
  listWrapper: _defaultListWrapper,
  defaultRenderer: _defaultRenderer,
  widgetWrapper: _defaultWidgetWrapper,
  disableWidgetFramework: false,
  errorHandler: console.error,
  fetchData: _defaultFetchJsonData,
  loader: _defaultLoader,
  renderers: {},
}

function configureWidgetFrameworkSettings(userSettings = {}) {
  return {
    ...defaultSettings
    ...userSettings
  }
}

export default configureWidgetFrameworkSettings
