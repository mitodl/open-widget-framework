var range = require('lodash.range')
const apiBase = window.apiBase

function fetchJsonData(url, resolve, request, reject) {
  if (reject === undefined) {
    reject = (error) => console.error(error)
  }

  if (request === undefined) {
    request = {method: 'GET'}
  } else {
    if ('method' in request === false) {
      request.method = 'POST'
    }
    if ('headers' in request === false) {
      request.headers = {
        'Content-Type': 'application/json',
        //'X-CSRFToken': window.csrfToken,
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

    case 'create_list':
      return apiBase + 'list/create'

    case 'get_list':
      return apiBase + 'list/' + listId

    case 'delete_list':
      return apiBase + 'list/' + listId + '/delete'

    case 'create_widget':
      return apiBase + 'list/' + listId + '/widget/create'

    case 'get_widget':
      return apiBase + 'list/' + listId + '/widget/' + widgetId

    case 'delete_widget':
      return apiBase + 'list/' + listId + '/widget/' + widgetId + '/delete'

    case 'update_widget':
      return apiBase + 'list/' + listId + '/widget/' + widgetId + '/update'

    case 'move_widget':
      return apiBase + 'list/' + listId + '/widget/' + widgetId + '/move' + '?position=' + args.position
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
