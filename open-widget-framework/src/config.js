import {_defaultRenderer, _defaultWidgetWrapper, _defaultListWrapper,
  _defaultFormWrapper, _defaultLoader, _defaultFetchJsonData} from './defaults'

function configureWidgetFrameworkSettings(userSettings) {
  if (userSettings === undefined) {
    userSettings = {}
  }

  let SETTINGS = {
    csrfToken: userSettings.csrfToken || '',
    defaultFormWrapper: userSettings.defaultFormWrapper || _defaultFormWrapper,
    defaultListWrapper: userSettings.defaultListWrapper || _defaultListWrapper,
    defaultRenderer: userSettings.defaultRenderer || _defaultRenderer,
    defaultWidgetWrapper: userSettings.defaultWidgetWrapper || _defaultWidgetWrapper,
    disableWidgetFramework: userSettings.disableWidgetFramework || false,
    errorHandler: userSettings.errorHandler || console.error,
    fetchData: userSettings.fetchData || _defaultFetchJsonData,
    loader: userSettings.loader || _defaultLoader,
    renderers: userSettings.renderers || {},
  }

  return SETTINGS
}

export default configureWidgetFrameworkSettings
