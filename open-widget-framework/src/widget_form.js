import React, { Component } from 'react'
import Select from 'react-select'

import { makeOptions } from './utils'
import { apiPath } from '../es/utils'


class EditWidgetForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentWidgetData: null,
      widgetClass: null,
      widgetClassConfiguration: null,
    }
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    /**
     * Fetch data on widget instances in list from fetchRoute
     */
    const { errorHandler, fetchData, widgetListId, widgetId } = this.props
    fetchData(apiPath('widget', widgetListId, widgetId))
      .then(data => this.setState({
        currentWidgetData: data.widgetData,
        widgetClassConfiguration: data.widgetClassConfigurations,
        widgetClass: Object.keys(data.widgetClassConfigurations)[0]}))
      .catch(errorHandler)
  }

  onSubmit(widgetClass, formData) {
    const { errorHandler, fetchData, onSubmit, widgetListId, widgetId } = this.props
    const { title, ...configuration } = formData
    fetchData(apiPath('widget', widgetListId, widgetId), {
      body: JSON.stringify({
        configuration: configuration,
        title: title,
        widget_class: widgetClass,
      }),
      method: 'PATCH',
    })
      .then(onSubmit)
      .catch(errorHandler)
  }

  render() {
    const { loader } = this.props
    const { widgetClass, widgetClassConfiguration, currentWidgetData } = this.state
    if (widgetClass === null || widgetClassConfiguration === null) {
      return (loader)
    } else {
      return <WidgetForm formData={currentWidgetData}
                         defaultValues={true}
                         onSubmit={this.onSubmit}
                         widgetClass={widgetClass}
                         widgetClassConfigurations={widgetClassConfiguration}
                         widgetClasses={[widgetClass]}
      />
    }
  }
}

class NewWidgetForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      widgetClassConfigurations: null,
      widgetClasses: null,
    }
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    /**
     * Fetch data on widget instances in list from fetchRoute
     */
    const { errorHandler, fetchData } = this.props
    fetchData(apiPath('get_configurations'))
      .then(data => {
        this.setState({
          widgetClassConfigurations: data.widgetClassConfigurations,
          widgetClasses: Object.keys(data.widgetClassConfigurations)})
      })
      .catch(errorHandler)
  }

  onSubmit(widgetClass, formData) {
    const { errorHandler, fetchData, onSubmit, widgetListId, listLength } = this.props
    const { title, ...configuration } = formData
    fetchData(apiPath('widget', widgetListId), {
      body: JSON.stringify({
        configuration: configuration,
        title: title,
        position: listLength,
        widget_list: widgetListId,
        widget_class: widgetClass,
      }),
      method: 'POST',
    })
      .then(onSubmit)
      .catch(errorHandler)
  }

  render() {
    const { loader } = this.props
    const { widgetClasses, widgetClassConfigurations } = this.state
    if (widgetClasses === null || widgetClassConfigurations === null) {
      return (loader)
    } else {
      return <WidgetForm formData={null}
                         defaultValues={false}
                         onSubmit={this.onSubmit}
                         widgetClass={''}
                         widgetClassConfigurations={widgetClassConfigurations}
                         widgetClasses={widgetClasses}
      />
    }
  }
}

class WidgetForm extends Component {
  /**
 * WidgetForm is a dynamically generated form with input fields defined by a configuration JSON blob
 *
 * Props:
 *    csrfToken: token to validate csrf with Django backend
 *    fetchRoute: where to fetch widget configurations from
 *    formDidSubmit: what to do after successful form submission, usually update widget list
 *    submitUrl: where to send fetch post request with this.state.formData
 */
  constructor(props) {
    super(props)
    this.state = {...this.props}
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.makeWidgetClassSelect = this.makeWidgetClassSelect.bind(this)
    this.renderInputs = this.renderInputs.bind(this)
  }

  onChange(key, value) {
    /**
     * Update this.state.formData with the new value on input form change
     */
    const { formData } = this.state
    this.setState({
      formData: {
        ...formData,
        [key]: value,
      },
    })
  }

  onSubmit(event) {
    /**
     * Submit widget configuration from this.state.formData to the server
     */
    event.preventDefault()

    const { onSubmit } = this.props
    const { formData, widgetClass } = this.state
    onSubmit(widgetClass, formData)
  }

  makeWidgetClassSelect() {
    const { widgetClasses } = this.state
    if (widgetClasses.length > 1) {
      return (
        <Select className="widget-form-input-select"
                id="widget-class-input-select"
                onChange={(option) => this.setState({widgetClass: option.value})}
                options={makeOptions(widgetClasses)}
                placeholder="Choose a widget class"/>
      )
    } else {
      return null
    }
  }

  render() {
    /**
     * Render a wrapper which handles form title and choosing which class of widget to configure
     */
    const { widgetClass, widgetClassConfigurations } = this.state
    return (
      <form onSubmit={this.onSubmit}>
        <div className="widget-form-input-group" id="widget-class-input-group">
          <label className='widget-class-select-label' id="widget-class-input-label" htmlFor="widget-class-select">
            {'Configure ' + widgetClass + ' Widget'}
          </label>
          {this.makeWidgetClassSelect()}
        </div>
        {this.renderInputs(widgetClassConfigurations[widgetClass])}
      </form>
    )
  }

  renderInputs(model) {
    /**
     * Render a widget configuration input form based on the this.state.formData.widgetClass
     */
    if (model === undefined) {
      return
    }
    const { defaultValues, formData } = this.state
    let formUI = model.map((field) => {
      let fieldKey = field.key
      let inputType = field.input_type || 'text'
      let props = field.props || {}

      let inputProps = {
        className: 'widget-form-input-' + inputType,
        defaultValue: null,
        id: fieldKey,
        key: fieldKey,
        onChange: (event) => {
          this.onChange(fieldKey, event.target.value)
        },
        ...props,
      }

      // Set default values if they exist
      if (defaultValues) {
        if (inputType === 'select') {
          inputProps.defaultValue = []
        } else {
          inputProps.defaultValue = formData[fieldKey]
        }
      }

      // Create options for select parameters and set defaultValue
      if (inputType === 'select') {
        inputProps.options = makeOptions(field.choice_keys, field.choice_values)
        if (defaultValues) {
          for (let option of inputProps.options) {
            if (formData[fieldKey].includes(option.value)) {
              inputProps.defaultValue.push(option)
            }
          }
        }
      }

      let input
      if (inputType === 'select') {
        if (props.isMulti) {
          inputProps.onChange = (selection) => {
            this.onChange(fieldKey, selection.map((option) => option.value))
          }
        } else {
          inputProps.onChange = (selection) => {
            this.onChange(fieldKey, selection.value)
          }
        }
        input = <Select {...inputProps}/>
      } else if (inputType === 'textarea') {
        input = <textarea {...inputProps}/>
      } else {
        input = <input {...inputProps}
                       type={inputType}/>
      }

      return (
        <div className='widget-form-input-group' key={fieldKey}>
          <label className='widget-form-input-label'
                 htmlFor={fieldKey}
                 key={fieldKey + '-label'}>
            {field.label}
          </label>
          {input}
        </div>
      )
    })
    return (
      <div className="widget-form-body">
        {formUI}
        <button className="widget-form-submit-btn" type='submit'>Submit</button>
      </div>
    )
  }
}

export { EditWidgetForm, NewWidgetForm }
