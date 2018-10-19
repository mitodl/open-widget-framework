import React, {Component} from 'react'
import {hot} from 'react-hot-loader'
import Select from 'react-select'
import {Link} from 'react-router-dom'

import {makeOptions} from './utils'


/**
 * WidgetForm is a dynamically generated form with input fields defined by a configuration JSON blob
 *
 * Props:
 *    csrfToken: token to validate csrf with Django backend
 *    fetchRoute: where to fetch widget configurations from
 *    formDidSubmit: what to do after successful form submission, usually update widget list
 *    submitUrl: where to send fetch post request with this.state.formData
 *    widgetList: widget list to add widget to
 */
class WidgetForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      formData: null,
      widgetClassConfigurations: null,
      widgetClasses: null,
    }
  }

  componentDidMount() {
    /**
     * Fetch available widget classes and configurations after component mount
     */
    fetch(this.props.fetchRoute)
      .then(data => {
        return data.json()
      })
      .then(jsonData => {
        this.setState({
          editWidget: jsonData.hasOwnProperty('widgetData'),
          formData: jsonData.hasOwnProperty('widgetData') ? jsonData.widgetData
            : {
              widget_class: '',
              widget_list: this.props.widgetList,
            },
          widgetClassConfigurations: jsonData.widgetClassConfigurations,
          widgetClasses: Object.keys(jsonData.widgetClassConfigurations),
        })
      })
      .catch(error => console.error(error))
  }

  onChange = (key, value) => {
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

  onSubmit = (event) => {
    /**
     * Submit widget configuration from this.state.formData to the server
     */
    event.preventDefault()
    fetch(this.props.submitUrl, {
      body: JSON.stringify(this.state.formData),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': this.props.csrfToken,
      },
      method: 'POST',
    })
      .then(data => { return data.json() })
      .then(jsonData => {
        this.props.formDidSubmit(jsonData)
      })
      .catch((error) => { console.error(error) })
  }

  makeWidgetClassSelect = () => {
    if (this.state.widgetClasses.length > 1) {
      return (
        <Select className={'widget-form-select'}
                id={'widget-class-select'}
                onChange={(option) => this.onChange('widget_class', option.value)}
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
    if (this.state.widgetClasses === null || this.state.widgetClassConfigurations === null) {
      return (<p>Loading</p>)
    } else {
      return (
        <form className={'card'} onSubmit={this.onSubmit}>
          <div className={'form-group card-header'}>
            <label className='widget-class-select-label' htmlFor={'widget-class-select'}>
              {'Configure ' + this.state.formData['widget_class'] + ' Widget'}
            </label>
            {this.makeWidgetClassSelect()}
            </div>
          {this.renderForm(this.state.widgetClassConfigurations[this.state.formData['widget_class']])}
          <Link className={'btn btn-danger'} to={'/list/' + this.props.widgetList + '/edit/'}>Cancel</Link>
        </form>
      )
    }
  }

  renderForm(model) {
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
      if (this.state.editWidget) {
        if (inputType === 'select') {
          inputProps.defaultValue = []
        } else {
          inputProps.defaultValue = this.state.formData[fieldKey]
        }
      }

      // Create options for select parameters and set defaultValue
      if (inputType === 'select') {
        let keys = Object.keys(field.choices)
        inputProps.options = makeOptions(keys, keys.map(key => field.choices[key]))
        if (this.state.editWidget) {
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

export default hot(module)(WidgetForm)
