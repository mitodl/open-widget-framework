var range = require('lodash.range')
const apiBase = window.apiBase

function fetchJsonData(url, resolve, request, reject) {
  if (reject === undefined) {
    reject = (error) => console.error(error)
  }

  if (request === undefined) {
    request = {method: 'GET'}
  } else {
    if ('headers' in request === false) {
      request.headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': window.csrfToken,
      }
    }
  }

  fetch(url, request)
    .then(data => data.json())
    .then((data) => resolve(data))
    .catch((data) => reject(data))
}

function apiPath(name, listId, widgetId, args) {
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

function makeOptions(values, labels) {
  if (labels === undefined) {
    labels = values
  }

  if (labels.length !== values.length) {
    return undefined
  }

  return range(labels.length).map(
    index => ({
      key: labels[index],
      label: labels[index],
      value: values[index],
    })
  )
}

export {makeOptions, fetchJsonData, apiPath}
