import range from 'lodash.range'

function fetchJsonData(url, resolve, request, reject) {
  if (reject === undefined) {
    reject = window.widgetFrameworkSettings.errorHandler
  }

  if (request === undefined) {
    request = {method: 'GET'}
  } else {
    if ('headers' in request === false) {
      request.headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': window.widgetFrameworkSettings.csrfToken,
      }
    }
  }

  fetch(url, request)
    .then(data => data.json())
    .then((data) => resolve(data))
    .catch((data) => reject(data))
}

function apiPath(name, listId, widgetId, args) {
  let apiBase = window.widgetFrameworkSettings.siteBaseUrl + 'api/v1/'
  switch (name) {
    case 'get_lists':
      return apiBase + 'lists'

    case 'get_configurations':
      return apiBase + 'configurations'

    case 'widget_list':
      return apiBase + 'list/' + (listId || '')

    case 'widget':
      return apiBase + 'list/' + listId + '/widget/' + (widgetId || '') + (args ? '?position=' + args.position : '')
  }
}

// TODO: split into two functions
function makeOptions(values, keys) {
  if (keys === undefined) {
    keys = values
  }

  if (keys.length !== values.length) {
    return []
  }

  return range(keys.length).map(
    index => ({
      key: keys[index],
      label: keys[index],
      value: values[index],
    })
  )
}

export {makeOptions, fetchJsonData, apiPath}
