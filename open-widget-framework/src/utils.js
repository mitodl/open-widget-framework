var range = require('lodash.range')

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

export {makeOptions}
