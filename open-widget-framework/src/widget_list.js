import React, { Component } from 'react'
import { apiPath } from './utils'
import { EditWidgetForm, NewWidgetForm } from './widget_form'
import { defaultSettings } from './config'


class WidgetList extends Component {
  /**
  * WidgetList is a list of rendered widgets
  *
  * Props:
  *    fetchRoute: where to fetch widgets in list from
  */
  // TODO: why do we need to use constructor

  static defaultProps = {...defaultSettings}

  constructor(props) {
    super(props)
    this.state = {widgetInstances: null}
    this.loadData = this.loadData.bind(this)
    this.updateWidgetList = this.updateWidgetList.bind(this)
    this.moveWidget = this.moveWidget.bind(this)
    this.deleteWidget = this.deleteWidget.bind(this)
    this.makePassThroughProps = this.makePassThroughProps.bind(this)
    this.makeFormProps = this.makeFormProps.bind(this)
    this.renderWidgetList = this.renderWidgetList.bind(this)
    this.renderListBody = this.renderListBody.bind(this)
    this.renderWidget = this.renderWidget.bind(this)
    this.renderWidgetBody = this.renderWidgetBody.bind(this)
    this.renderEditWidgetForm = this.renderEditWidgetForm.bind(this)
    this.renderNewWidgetForm = this.renderNewWidgetForm.bind(this)
    this.renderEditWidgetFormBody = this.renderEditWidgetFormBody.bind(this)
    this.renderNewWidgetFormBody = this.renderNewWidgetFormBody.bind(this)
  }

  componentDidMount() {
    /**
     * Fetch data on widget instances in list from fetchRoute
     */
    this.loadData()
  }

  componentDidUpdate(prevProps) {
    /**
     * Fetch new widgets when url changes
     */
    if (prevProps.widgetListId !== this.props.widgetListId) {
      this.loadData()
    }
  }

  loadData() {
    const { widgetListId, errorHandler, fetchData } = this.props
    fetchData(apiPath('widget_list', widgetListId))
      .then(this.updateWidgetList)
      .catch(errorHandler)
  }

  updateWidgetList(data) {
    this.setState({widgetInstances: data})
  }

  deleteWidget(widgetId) {
    /**
     * Make request to server to delete widget
     */
    const { widgetListId, errorHandler, fetchData } = this.props
    fetchData(apiPath('widget', widgetListId, widgetId), {method: 'DELETE'})
      .then(this.updateWidgetList)
      .catch(errorHandler)
  }

  moveWidget(widgetId, position) {
    /**
     * Make request to server to move widget up
     */
    const { widgetListId, errorHandler, fetchData } = this.props
    fetchData(apiPath('widget', widgetListId, widgetId), {
        body: JSON.stringify({position: position}),
        method: 'PATCH'
      })
      .then(this.updateWidgetList)
      .catch(errorHandler)
  }

  makePassThroughProps(widgetInstance) {
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

  makeFormProps() {
    const { widgetListId, errorHandler, fetchData, loader } = this.props
    const { widgetInstances } = this.state
    return {
      fetchData: fetchData,
      errorHandler: errorHandler,
      loader: loader,
      widgetListId: widgetListId,
      listLength: widgetInstances.length,
      onSubmit: this.updateWidgetList,
    }
  }

  renderWidgetList() {
    const { ListWrapper, listWrapperProps } = this.props
    return (
      <ListWrapper {...this.makePassThroughProps()}
                   {...listWrapperProps}
      />
    )
  }

  renderListBody(listWrapperProps) {
    const { widgetInstances } = this.state
    return (
      widgetInstances.map(widgetInstance => this.renderWidget(widgetInstance, listWrapperProps))
    )
  }

  renderWidget(widgetInstance, listWrapperProps) {
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

  renderWidgetBody(widgetInstance) {
    const { renderers, defaultRenderer } = this.props
    const Renderer = renderers[widgetInstance.reactRenderer] || defaultRenderer
    return (
      <Renderer {...widgetInstance}
                {...widgetInstance.configuration}
      />
    )
  }

  renderEditWidgetForm(widgetId, listWrapperProps) {
    const { FormWrapper, formWrapperProps } = this.props
    return (
      <FormWrapper {...this.makePassThroughProps(widgetId)}
                   renderForm={(formProps) => this.renderEditWidgetFormBody(widgetId, formProps)}
                   {...formWrapperProps}
                   {...listWrapperProps}
      />
    )
  }

  renderEditWidgetFormBody(widgetId, formWrapperProps) {
    return (
      <EditWidgetForm {...this.makeFormProps()}
                      widgetId={widgetId}
                      {...formWrapperProps}
      />
    )
  }

  renderNewWidgetForm(listWrapperProps) {
    const { FormWrapper, formWrapperProps } = this.props
    return (
      <FormWrapper {...this.makePassThroughProps()}
                   renderForm={(formProps) => this.renderNewWidgetFormBody(formProps)}
                   {...formWrapperProps}
                   {...listWrapperProps}

      />
    )
  }

  renderNewWidgetFormBody(formWrapperProps) {
    return (
      <NewWidgetForm {...this.makeFormProps()}
                     {...formWrapperProps}
      />
    )
  }

  render() {
    /**
     * Render list of WidgetDisplays with overhead buttons enabling editing and WidgetForm generation
     */
    const { disableWidgetFramework, loader } = this.props
    const { widgetInstances } = this.state
    if (disableWidgetFramework) {
      return null
    } else if (widgetInstances === null) {
      return (loader)
    } else {
      return (
        <div className="widget-sidebar container bg-secondary rounded">
          {this.renderWidgetList()}
        </div>
      )
    }
  }
}

export default WidgetList
