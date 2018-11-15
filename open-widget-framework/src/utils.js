import range from 'lodash.range'

function apiPath(name, listId, widgetId) {
  /**
   * constructs an api path based on the view name and the list and widget ids
   */
  let apiBase = '/api/v1/'
  switch (name) {
    case 'get_lists':
      return apiBase + 'lists'

    case 'get_configurations':
      return apiBase + 'configurations'

    case 'widget_list':
      return apiBase + 'list/' + (listId || '')

    case 'widget':
      return apiBase + 'list/' + listId + '/widget/' + (widgetId || '')
  }
}

// TODO: split into two functions

function makeOptionsFromList(values) {
  /**
   * constructs an options object from a list of values
   */
  return range(values.length).map(
    index => ({
      key: values[index],
      label: values[index],
      value: values[index],
    })
  )
}

function makeOptionsFromObject(options) {
  /**
   * constructs an options object from an object of key, value mappings
   */
  const keys = Object.keys(options)
  return range(keys.length).map(
    index => ({
      key: keys[index],
      label: keys[index],
      value: options[keys[index]],
    })
  )
}

export {makeOptionsFromList, makeOptionsFromObject, apiPath}
