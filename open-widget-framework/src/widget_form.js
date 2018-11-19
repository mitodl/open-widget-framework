import React, { Component } from 'react'
import Select from 'react-select'

import { makeOptionsFromList, makeOptionsFromObject } from './utils'
import { apiPath } from '../es/utils'


class EditWidgetForm extends Component {
  /**
   * EditWidgetForm handles rendering a WidgetForm with initial data matching a current widget and sending that form
   *    as a PATCH request to the backend
   *
   * State:
   *    currentWidgetData: the current data of the widget to edit
   *    widgetClass: the class of the widget to edit
   *    widgetClassConfiguration: an object that maps the widget's class to that class's configuration
   *
   * Props:
   *    widgetId: id of the widget to edit
   *
   *    formProps (see makeFormProps in widget_list.js)
   *    formWrapperProps (defined by custom FormWrapper or _defaultFormWrapper in defaults.js
   */
  state = {
    currentWidgetData: null,
    widgetClass: null,
    widgetClassConfiguration: null,
  }

  componentDidMount() {
    /**
     * Fetch data about the widget to edit and set state
     */
    const { errorHandler, fetchData, widgetListId, widgetId } = this.props
    fetchData(apiPath('widget', widgetListId, widgetId))
      .then(data => this.setState({
        currentWidgetData: data.widgetData,
        widgetClassConfiguration: data.widgetClassConfigurations,
        widgetClass: Object.keys(data.widgetClassConfigurations)[0]}))
      .catch(errorHandler)
  }

  onSubmit = (widgetClass, formData) => {
    /**
     * onSubmit is the onClick behavior of the submit button. It parses the title out of the data and makes a PATCH
     *    request to the backend. Then it calls the passed in prop onSubmit
     *
     * inputs:
     *    widgetClass: the class of the widget to edit. Less important for EditWidgetForm but allows WidgetForm to
     *        accept onSubmit from both Edit- and Add- WidgetForm components
     *    formData: data from the WidgetForm
     */
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
    /**
     * If data is loaded, render a widget form with initial data from the widget
     */
    const { Loader } = this.props
    const { widgetClass, widgetClassConfiguration, currentWidgetData } = this.state
    if (widgetClass === null || widgetClassConfiguration === null) {
      return <Loader/>
    } else {
      return <WidgetForm formData={currentWidgetData}
                         onSubmit={this.onSubmit}
                         widgetClass={widgetClass}
                         widgetClassConfigurations={widgetClassConfiguration}
                         widgetClasses={[widgetClass]}
      />
    }
  }
}

class NewWidgetForm extends Component {
  /**
   * NewWidgetForm handles rendering a WidgetForm for a new widget and directing that form data as a POST request to
   *    the backend
   *
   * State:
   *    widgetClasses: the classes of the widget available to create
   *    widgetClassConfigurations: an object that maps the widget classes to those classes' configurations
   *
   * Props:
   *    formProps (see makeFormProps in widget_list.js)
   *    formWrapperProps (defined by custom FormWrapper or _defaultFormWrapper in defaults.js
   */
  state = {
    widgetClassConfigurations: null,
    widgetClasses: null,
  }

  componentDidMount() {
    /**
     * Fetch data on available widget classes and set state
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

  onSubmit = (widgetClass, formData) => {
    /**
     * onSubmit is the onClick behavior of the submit button. It parses the title out of the data and makes a POST
     *    request to the backend. Then it calls the passed in prop onSubmit
     *
     * inputs:
     *    widgetClass: the class of the widget to create.
     *    formData: data from the WidgetForm
     */
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
    /**
     * If data is loaded, render a blank widget form
     */
    const { Loader } = this.props
    const { widgetClasses, widgetClassConfigurations } = this.state
    if (widgetClasses === null || widgetClassConfigurations === null) {
      return <Loader/>
    } else {
      return <WidgetForm formData={null}
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
   *    formData: the default values for the form. If null, all inputs will start blank
   *    onSubmit(widgetClass, data): the behavior to take when the form is submitted
   *    widgetClass: the class of the widget being edited or the empty string for a new widget
   *    widgetClassConfigurations: object containing available configurations for the available widget classes
   *    widgetClasses: list of available widget classes
   *
   * State:
   *    formData: keeps track of the current input of the form
   *    widgetClass: keeps track of the current chosen class
   */
  state = {
    formData: this.props.formData,
    widgetClass: this.props.widgetClass,
  }

  onChange(key, value) {
    /**
     * Update formData with the new value on input form change
     */
    const { formData } = this.state
    this.setState({
      formData: {
        ...formData,
        [key]: value,
      },
    })
  }

  onSubmit = (event) => {
    /**
     * Submit widget class and form data with onSubmit from props
     */
    event.preventDefault()

    const { onSubmit } = this.props
    const { formData, widgetClass } = this.state
    onSubmit(widgetClass, formData)
  }

  makeWidgetClassSelect = () => {
    /**
     * makeWidgetClassSelect makes a react-select component
     */
    const { widgetClasses } = this.props
    return (
      <Select className="widget-form-input-select"
              id="widget-class-input-select"
              onChange={(option) => this.setState({widgetClass: option.value})}
              options={makeOptionsFromList(widgetClasses)}
              placeholder="Choose a widget class"/>
    )
  }

  render() {
    /**
     * Render a wrapper which handles form title and choosing which class of widget to configure
     */
    const { widgetClasses, widgetClassConfigurations } = this.props
    const { widgetClass } = this.state
    return (
      <form onSubmit={this.onSubmit}>
        <div className="widget-form-input-group" id="widget-class-input-group">
          <label className='widget-class-select-label' id="widget-class-input-label" htmlFor="widget-class-select">
            {`Configure ${widgetClass} Widget`}
          </label>
          {widgetClasses.length > 1 ? this.makeWidgetClassSelect() : null}
        </div>
        {this.renderInputs(widgetClassConfigurations[widgetClass])}
      </form>
    )
  }

  renderInputs = (model) => {
    /**
     * Render widget form inputs based on the configuration of widgetClass
     *
     * inputs:
     *    model: a list of input fields that contain:
     *      key: a unique key
     *      inputType: the type of input field
     *      props: props to put on the input field
     */
    if (model === undefined) {
      return
    }
    const { formData } = this.props
    let formUI = model.map((field) => {
      const { key, inputType, props, choices, label } = field

      let inputProps = {
        className: `widget-form-input-${inputType}`,
        defaultValue: null,
        id: `widget-form-input-${key}`,
        key: key,
        onChange: (event) => {
          this.onChange(key, event.target.value)
        },
        ...props,
      }

      // Set default values if they exist
      if (formData !== null) {
        if (inputType === 'select') {
          inputProps.defaultValue = []
        } else {
          inputProps.defaultValue = formData[key]
        }
      }

      // Create options for select parameters and set defaultValue
      if (inputType === 'select') {
        inputProps.options = makeOptionsFromObject(choices)
        if (formData !== null) {
          for (let option of inputProps.options) {
            if (formData[key].includes(option.value)) {
              inputProps.defaultValue.push(option)
            }
          }
        }
      }

      let input
      if (inputType === 'select') {
        if (props.isMulti) {
          inputProps.onChange = (selection) => {
            this.onChange(key, selection.map((option) => option.value))
          }
        } else {
          inputProps.onChange = (selection) => {
            this.onChange(key, selection.value)
          }
        }
        input = <Select {...inputProps}/>
      } else if (inputType === 'textarea') {
        input = <textarea {...inputProps}/>
      } else {
        input = <input {...inputProps}
                       type="text"/>
      }

      return (
        <div className='widget-form-input-group' key={key}>
          <label className='widget-form-input-label'
                 htmlFor={key}
                 key={key + '-label'}>
            {label}
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
