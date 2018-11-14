import React, {Component} from 'react'
import Select from 'react-select'

import {makeOptions} from './utils'
import {apiPath} from '../es/utils'


class EditWidgetForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      widgetClass: null,
      widgetClassConfiguration: null,
    }
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    /**
     * Fetch data on widget instances in list from fetchRoute
     */
    this.props.widgetFrameworkSettings.fetchData(apiPath('widget', this.props.widgetListId, this.props.widgetId))
      .then(data => this.setState({
        currentWidgetData: data.widgetData,
        widgetClassConfiguration: data.widgetClassConfigurations,
        widgetClass: Object.keys(data.widgetClassConfigurations)[0]}))
      .catch(this.props.widgetFrameworkSettings.errorHandler)
  }

  onSubmit(widgetClass, formData) {
    let title = formData.title
    delete formData.title
    this.props.widgetFrameworkSettings.fetchData(apiPath('widget', this.props.widgetListId, this.props.widgetId), {
      body: JSON.stringify({
        configuration: formData,
        title: title,
        widget_class: this.state.widgetClass,
      }),
      method: 'PATCH',
    })
      .then(this.props.onSubmit)
      .catch(this.props.widgetFrameworkSettings.errorHandler)
  }

  render() {
    if (this.state.widgetClass === null || this.state.widgetClassConfiguration === null) {
      return (this.props.widgetFrameworkSettings.loader)
    } else {
      return <WidgetForm formData={this.state.currentWidgetData}
                         defaultValues={true}
                         onSubmit={this.onSubmit}
                         widgetClass={this.state.widgetClass}
                         widgetClassConfigurations={this.state.widgetClassConfiguration}
                         widgetClasses={[this.state.widgetClass]}
      />
    }
  }
}

class NewWidgetForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      widgetClasses: null,
      widgetClassConfigurations: null,
    }
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    /**
     * Fetch data on widget instances in list from fetchRoute
     */
    this.props.widgetFrameworkSettings.fetchData(apiPath('get_configurations'))
      .then(data => {
        this.setState({
          widgetClassConfigurations: data.widgetClassConfigurations,
          widgetClasses: Object.keys(data.widgetClassConfigurations)})
      })
      .catch(this.props.widgetFrameworkSettings.errorHandler)
  }

  onSubmit(widgetClass, formData) {
    let title = formData.title
    delete formData.title
    this.props.widgetFrameworkSettings.fetchData(apiPath('widget', this.props.widgetListId), {
      body: JSON.stringify({
        configuration: formData,
        title: title,
        position: this.props.listLength,
        widget_list: this.props.widgetListId,
        widget_class: widgetClass,
      }),
      method: 'POST',
    })
      .then(this.props.onSubmit)
      .catch(this.props.widgetFrameworkSettings.errorHandler)
  }

  render() {
    if (this.state.widgetClasses === null || this.state.widgetClassConfigurations === null) {
      return (this.props.widgetFrameworkSettings.loader)
    } else {
      return <WidgetForm formData={null}
                         defaultValues={false}
                         onSubmit={this.onSubmit}
                         widgetClass={''}
                         widgetClassConfigurations={this.state.widgetClassConfigurations}
                         widgetClasses={this.state.widgetClasses}
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
    this.state = this.props
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.makeWidgetClassSelect = this.makeWidgetClassSelect.bind(this)
    this.renderInputs = this.renderInputs.bind(this)
  }

  onChange(key, value) {
    /**
     * Update this.state.formData with the new value on input form change
     */
    this.setState({
      formData: {
        ...this.state.formData,
        [key]: value,
      },
    })
  }

  onSubmit(event) {
    /**
     * Submit widget configuration from this.state.formData to the server
     */
    event.preventDefault()
    this.props.onSubmit(this.state.widgetClass, this.state.formData)
  }

  makeWidgetClassSelect() {
    if (this.state.widgetClasses.length > 1) {
      return (
        <Select className={'widget-form-select'}
                id={'widget-class-select'}
                onChange={(option) => this.setState({widgetClass: option.value})}
                options={makeOptions(this.state.widgetClasses)}
                placeholder={'Choose a widget class'}/>
      )
    } else {
      return null
    }
  }

  render() {
    /**
     * Render a wrapper which handles form title and choosing which class of widget to configure
     */
    return (
      <form className={'card'} onSubmit={this.onSubmit}>
        <div className={'form-group card-header'}>
          <label className='widget-class-select-label' htmlFor={'widget-class-select'}>
            {'Configure ' + this.state.widgetClass + ' Widget'}
          </label>
          {this.makeWidgetClassSelect()}
        </div>
        {this.renderInputs(this.state.widgetClassConfigurations[this.state.widgetClass])}
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
    let formUI = model.map((field) => {
      let fieldKey = field.key
      let inputType = field.input_type || 'text'
      let props = field.props || {}

      let inputProps = {
        className: (inputType !== 'select' ? 'form-control ' : '') + 'widget-form-' + inputType,
        defaultValue: null,
        id: fieldKey,
        key: fieldKey,
        onChange: (event) => {
          this.onChange(fieldKey, event.target.value)
        },
        ...props,
      }

      // Set default values if they exist
      if (this.state.defaultValues) {
        if (inputType === 'select') {
          inputProps.defaultValue = []
        } else {
          inputProps.defaultValue = this.state.formData[fieldKey]
        }
      }

      // Create options for select parameters and set defaultValue
      if (inputType === 'select') {
        inputProps.options = makeOptions(field.choice_keys, field.choice_values)
        if (this.state.defaultValues) {
          for (let option of inputProps.options) {
            if (this.state.formData[fieldKey].includes(option.value)) {
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
        <div className='widget-form-group form-group' key={fieldKey}>
          <label className='widget-form-label'
                 htmlFor={fieldKey}
                 key={fieldKey + '-label'}>
            {field.label}
          </label>
          {input}
        </div>
      )
    })
    return (
      <div className='widget-form-body card-body'>
        {formUI}
        <button className={'widget-form-submit btn btn-primary'} type='submit'>Submit</button>
      </div>
    )
  }
}

export { EditWidgetForm, NewWidgetForm }
