import {_defaultRenderer, _defaultWidgetWrapper, _defaultListWrapper,
  _defaultFormWrapper, _defaultLoader} from './defaults'

function configureWidgetFrameworkSettings(userSettings) {
  let SETTINGS = {
    csrfToken: userSettings.csrfToken || '',
    defaultFormWrapper: userSettings.defaultFormWrapper || _defaultFormWrapper,
    defaultListWrapper: userSettings.defaultListWrapper || _defaultListWrapper,
    defaultRenderer: userSettings.defaultRenderer || _defaultRenderer,
    defaultWidgetWrapper: userSettings.defaultWidgetWrapper || _defaultWidgetWrapper,
    disableWidgetFramework: userSettings.disableWidgetFramework || false,
    errorHandler: userSettings.errorHandler || console.error,
    loader: userSettings.loader || _defaultLoader,
    renderers: userSettings.renderers || {},
    siteBaseUrl: userSettings.siteBaseUrl || 'https://localhost:8000/',
  }

  window.widgetFrameworkSettings = SETTINGS
}

export default configureWidgetFrameworkSettings
