import React, { Component } from 'react'
import { apiPath } from './utils'
import { EditWidgetForm, NewWidgetForm } from './widget_form'
import { defaultSettings } from './config'


class WidgetList extends Component {
  /**
   * WidgetList is a list of rendered widgets. It manages list, widget, and form wrappers and is the primary component
   *    in this library
   *
   * Props:
   *    widgetListId: the id of the widget list to be rendered by the component. This matches the id in the django app
   *    listWrapperProps: custom props to pass to the list wrapper
   *    widgetWrapperProps: custom props to pass to the widget wrapper
   *    formWrapperProps: custom props to pass to the form wrapper
   *
   *    defaultProps: these props are settings that are propogated to the component's children. They are set by
   *        default but can be overridden. See config.js for a list of these
   *        settings.
   *
   * State:
   *    widgetInstances: a list of widgets in the widget list. Each widget is a serialization of the widgetInstance
   *        model from the django backend containing id, position, widget_class, react_renderer, widget_list, title,
   *        and configuration
   */
  // TODO: why do we need to use constructor

  static defaultProps = {...defaultSettings}

  state = {widgetInstances: null}

  componentDidMount() {
    /**
     * Retrieve widgetInstances
     */
    this.loadData()
  }

  componentDidUpdate(prevProps) {
    /**
     * If the widget-list changes, retrieve data again
     */
    if (prevProps.widgetListId !== this.props.widgetListId) {
      this.loadData()
    }
  }

  loadData = () => {
    /**
     * loadData fetches the widget instances and runs updateWidgetList
     */
    const { widgetListId, errorHandler, fetchData } = this.props
    fetchData(apiPath('widget_list', widgetListId))
      .then(this.updateWidgetList)
      .catch(errorHandler)
  }

  updateWidgetList = (data) => {
    /**
     * updateWidgetList takes widgetInstances data and sets the state
     */
    this.setState({widgetInstances: data})
  }

  deleteWidget = (widgetId) => {
    /**
     * Make request to server to delete a widget with id widgetId
     */
    const { widgetListId, errorHandler, fetchData } = this.props
    fetchData(apiPath('widget', widgetListId, widgetId), {method: 'DELETE'})
      .then(this.updateWidgetList)
      .catch(errorHandler)
  }

  moveWidget = (widgetId, position) => {
    /**
     * Make request to server to move widget with id widgetId to position in the widget-list
     */
    const { widgetListId, errorHandler, fetchData } = this.props
    fetchData(apiPath('widget', widgetListId, widgetId), {
        body: JSON.stringify({position: position}),
        method: 'PATCH'
      })
      .then(this.updateWidgetList)
      .catch(errorHandler)
  }

  makePassThroughProps = (widgetInstance) => {
    /**
     * makePassThroughProps constructs an object of props to pass to children components. This allows the wrapper
     *    components to have access to various information from the widget-list and ways of manipulating the
     *    widget-list. If a widgetInstance is passed in, the props are tailored to manipulate that widget only
     *
     * passThoughProps:
     *    widgetListId: id of the current widget-list
     *    listLength: the length of the widget-list
     *    moveWidget(id, position): moves widget with id to position
     *    deleteWidget(id): deletes widget with id
     *    updateWidgetList(data): receives widgetInstances data and updates widget list
     *
     *    renderList: renders the body of the widget-list which runs renders each widget instance in the list
     *    renderWidget: renders the body of the widget which finds the appropriate renderer and renders the instance
     *    renderNewWidgetForm: renders an empty widget-form to create a widget
     *    renderEditWidgetForm(id): renders a widget-form to edit a widget with id
     */
    const { widgetListId } = this.props
    const { widgetInstances } = this.state
    let passThroughProps = {
      deleteWidget: this.deleteWidget,
      listLength: widgetInstances.length,
      moveWidget: this.moveWidget,
      renderList: this.renderListBody,
      renderWidget: this.renderWidgetBody,
      renderEditWidgetForm: this.renderEditWidgetForm,
      renderNewWidgetForm: this.renderNewWidgetForm,
      updateWidgetList: this.updateWidgetList,
      widgetListId: widgetListId,
    }
    if (widgetInstance !== undefined) {
      passThroughProps = Object.assign(passThroughProps, {
        deleteWidget: () => this.deleteWidget(widgetInstance.id),
        moveWidget: (position) => this.moveWidget(widgetInstance.id, position),
        renderEditWidgetForm: () => this.renderEditWidgetForm(widgetInstance.id),
        renderWidget: () => this.renderWidgetBody(widgetInstance),
      })
    }

    return passThroughProps
  }

  makeFormProps = () => {
    /**
     * makeFormProps constructs an object of props to pass to widget-forms. These are the defaultProps and
     * passThroughProps that are required for handling the widget-forms
     *
     * formProps:
     *    widgetListId: id of the current widget-list
     *    listLength: the length of the widget-list
     *    onSubmit: behavior for after the form submits
     *
     *    fetchData: the fetch wrapper set in config.js
     *    errorHandler: the error handling function set in config.js
     *    Loader: the Loader component set in config.js
     */
    const { widgetListId, errorHandler, fetchData, Loader } = this.props
    const { widgetInstances } = this.state
    return {
      fetchData: fetchData,
      errorHandler: errorHandler,
      Loader: Loader,
      widgetListId: widgetListId,
      listLength: widgetInstances.length,
      onSubmit: this.updateWidgetList,
    }
  }

  renderWidgetList = () => {
    /**
     * renders ListWrapper with passThroughProps and any listWrapperProps passed to widget-list.
     *    Will call renderListBody.
     */
    const { ListWrapper, listWrapperProps } = this.props
    return (
      <ListWrapper {...this.makePassThroughProps()}
                   {...listWrapperProps}
      />
    )
  }

  renderListBody = (listWrapperProps) => {
    /**
     * renders each widget instance
     */
    const { widgetInstances } = this.state
    return (
      widgetInstances.map(widgetInstance => this.renderWidget(widgetInstance, listWrapperProps))
    )
  }

  renderWidget = (widgetInstance, listWrapperProps) => {
    /**
     * renders WidgetWrapper with passThroughProps, any widgetWrapperProps passed to widget-list, any listWrapperProps
     *    passed from ListWrapper, and the elements of widgetInstance as props as well. Will call renderWidgetBody.
     */
    const { WidgetWrapper, widgetWrapperProps } = this.props
    return (
      <WidgetWrapper key={widgetInstance.id}
                     {...widgetInstance}
                     {...this.makePassThroughProps(widgetInstance)}
                     {...widgetWrapperProps}
                     {...listWrapperProps}
      />
    )
  }

  renderWidgetBody = (widgetInstance) => {
    /**
     * finds appropriate renderer and render the widget instance
     */
    const { renderers, defaultRenderer } = this.props
    const Renderer = renderers[widgetInstance.reactRenderer] || defaultRenderer
    return (
      <Renderer {...widgetInstance}
                {...widgetInstance.configuration}
      />
    )
  }

  renderEditWidgetForm = (widgetId, listWrapperProps) => {
    /**
     * renders FormWrapper with passThroughProps, any formWrapperProps passed to widget-list, and any listWrapperProps
     *    passed from ListWrapper. Will call renderEditWidgetFormBody
     */
    const { FormWrapper, formWrapperProps } = this.props
    return (
      <FormWrapper {...this.makePassThroughProps(widgetId)}
                   renderForm={(formProps) => this.renderEditWidgetFormBody(widgetId, formProps)}
                   {...formWrapperProps}
                   {...listWrapperProps}
      />
    )
  }

  renderEditWidgetFormBody = (widgetId, formWrapperProps) => {
    /**
     * renders an EditWidgetForm for widget with widgetId with formProps and any formWrapperProps passed from
     *    FormWrapper
     */
    return (
      <EditWidgetForm {...this.makeFormProps()}
                      widgetId={widgetId}
                      {...formWrapperProps}
      />
    )
  }

  renderNewWidgetForm = (listWrapperProps) => {
    /**
     * renders FormWrapper with passThroughProps, any formWrapperProps passed to widget-list, and any listWrapperProps
     *    passed from ListWrapper. Will call renderNewWidgetFormBody
     */
    const { FormWrapper, formWrapperProps } = this.props
    return (
      <FormWrapper {...this.makePassThroughProps()}
                   renderForm={(formProps) => this.renderNewWidgetFormBody(formProps)}
                   {...formWrapperProps}
                   {...listWrapperProps}

      />
    )
  }

  renderNewWidgetFormBody = (formWrapperProps) => {
    /**
     * renders an NewWidgetForm with formProps and any formWrapperProps passed from FormWrapper
     */
    return (
      <NewWidgetForm {...this.makeFormProps()}
                     {...formWrapperProps}
      />
    )
  }

  render() {
    /**
     * If data is loaded, runs renderWidgetList
     */
    const { disableWidgetFramework, Loader } = this.props
    const { widgetInstances } = this.state
    if (disableWidgetFramework) {
      return null
    } else if (widgetInstances === null) {
      return <Loader/>
    } else {
      return (
        <div className="widget-list">
          {this.renderWidgetList()}
        </div>
      )
    }
  }
}

export default WidgetList
