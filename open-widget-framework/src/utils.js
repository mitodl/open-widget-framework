import range from 'lodash.range'

function apiPath(name, listId, widgetId, args) {
  let apiBase = 'api/v1/'
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

export {makeOptions, apiPath}
