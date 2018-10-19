import {apiBase} from './config'

function fetchJsonData(url, resolve, reject, request = null) {
  if (reject === undefined) {
    reject = error => console.error(error)
  }

  if (request === null) {
    request = {method: 'GET'}
  } else {
    if (!request.hasOwnProperty('method')) {
      request.method = 'POST'
    }
    if (!request.hasOwnProperty('headers')) {
      request.headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': this.props.csrfToken,
      }
    }
  }

  fetch(url, request)
    .then(data => data.json())
    .then(resolve)
    .catch(reject)
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

export {fetchJsonData, apiPath}
