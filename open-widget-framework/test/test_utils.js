import range from 'lodash.range'

function mockTextWidget(position) {
  return {
    id: position,
    position: position,
    widgetProps: {
      html: '<p>example' + position + '</p>',
      position: position,
      reactRenderer: null,
      title: 'example' + position,
    },
  }
}

function mockWidgetInstances(numWidgets) {
  return range(numWidgets).map(i => mockTextWidget(i))
}

function mockFetchData(data) {
  return async (url, request) => {
    return await new Promise(resolve => {
      resolve(data)
    })
  }
}

export {mockWidgetInstances, mockTextWidget, mockFetchData}

