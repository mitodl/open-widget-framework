import React, {Component} from 'react'
import {apiPath} from './utils'
import {EditWidgetForm, NewWidgetForm} from './widget_form'
import configureWidgetFrameworkSettings from './config'


class WidgetList extends Component {
  /**
  * WidgetList is a list of rendered widgets
  *
  * Props:
  *    fetchRoute: where to fetch widgets in list from
  */
  // TODO: why do we need to use constructor
  constructor(props) {
    super(props)
    this.state = {
      editModeActive: false,
      retrieveFormRoute: null,
      submitFormMethod: null,
      submitFormRoute: null,
      widgetFrameworkSettings: configureWidgetFrameworkSettings(this.props.widgetFrameworkSettings),
      widgetInstances: null,
    }
    this.updateWidgetList = this.updateWidgetList.bind(this)
    this.moveWidget = this.moveWidget.bind(this)
    this.deleteWidget = this.deleteWidget.bind(this)
    this.makePassThroughProps = this.makePassThroughProps.bind(this)
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
    this.state.widgetFrameworkSettings.fetchData(apiPath('widget_list', this.props.widgetListId))
      .then(this.updateWidgetList)
      .catch(this.state.widgetFrameworkSettings.errorHandler)
  }

  componentDidUpdate(prevProps) {
    /**
     * Fetch new widgets when url changes
     */
    if (prevProps.widgetListId !== this.props.widgetListId) {
      this.state.widgetFrameworkSettings.fetchData(apiPath('widget_list', this.props.widgetListId))
        .then(this.updateWidgetList)
        .catch(this.state.widgetFrameworkSettings.errorHandler)
      this.setState({editModeActive: false})
    }
  }

  updateWidgetList(data) {
    this.setState({widgetInstances: data})
  }

  deleteWidget(widgetId) {
    /**
     * Make request to server to delete widget
     */
    this.state.widgetFrameworkSettings.fetchData(
      apiPath('widget', this.props.widgetListId, widgetId),
      {method: 'DELETE'})
      .then(this.updateWidgetList)
      .catch(this.state.widgetFrameworkSettings.errorHandler)
  }

  moveWidget(widgetId, position) {
    /**
     * Make request to server to move widget up
     */
    this.state.widgetFrameworkSettings.fetchData(
      apiPath('widget', this.props.widgetListId, widgetId),
      {
        body: JSON.stringify({position: position}),
        method: 'PATCH'
      })
      .then(this.updateWidgetList)
      .catch(this.state.widgetFrameworkSettings.errorHandler)
  }

  makePassThroughProps(widgetInstance) {
    let passThroughProps = {
      deleteWidget: this.deleteWidget,
      listLength: this.state.widgetInstances.length,
      moveWidget: this.moveWidget,
      renderList: this.renderListBody,
      renderWidget: this.renderWidgetBody,
      renderEditWidgetForm: this.renderEditWidgetForm,
      renderNewWidgetForm: this.renderNewWidgetForm,
      updateWidgetList: this.updateWidgetList,
      widgetListId: this.props.widgetListId,
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

  renderWidgetList() {
    let ListWrapper
    if ('listWrapper' in this.props) {
      ListWrapper = this.props.listWrapper
    } else {
      ListWrapper = this.state.widgetFrameworkSettings.defaultListWrapper
    }
    return (
      <ListWrapper {...this.makePassThroughProps()}
                   {...this.props.listWrapperProps}
      />
    )
  }

  renderListBody(listWrapperProps) {
    return (
      this.state.widgetInstances.map(widgetInstance => this.renderWidget(widgetInstance, listWrapperProps))
    )
  }

  renderWidget(widgetInstance, listWrapperProps) {
    let WidgetWrapper
    if ('widgetWrapper' in this.props) {
      WidgetWrapper = this.props.widgetWrapper
    } else {
      WidgetWrapper = this.state.widgetFrameworkSettings.defaultWidgetWrapper
    }
    return (
      <WidgetWrapper key={widgetInstance.id}
                     {...widgetInstance}
                     {...this.makePassThroughProps(widgetInstance)}
                     {...this.props.widgetWrapperProps}
                     {...listWrapperProps}
      />
    )
  }

  renderWidgetBody(widgetInstance) {
    const Renderer = this.state.widgetFrameworkSettings.renderers[widgetInstance.reactRenderer]
      || this.state.widgetFrameworkSettings.defaultRenderer
    return (
      <Renderer {...widgetInstance}
                {...widgetInstance.configuration}
      />
    )
  }

  renderEditWidgetForm(widgetId, listProps) {
    let FormWrapper
    if ('formWrapper' in this.props) {
      FormWrapper = this.props.formWrapper
    } else {
      FormWrapper = this.state.widgetFrameworkSettings.defaultFormWrapper
    }
    return (
      <FormWrapper {...this.makePassThroughProps(widgetId)}
                   {...listProps}
                   renderForm={(formProps) => this.renderEditWidgetFormBody(widgetId, formProps)}
      />
    )
  }

  renderEditWidgetFormBody(widgetId, formProps) {
    return (
      <EditWidgetForm widgetListId={this.props.widgetListId}
                      widgetId={widgetId}
                      widgetFrameworkSettings={this.state.widgetFrameworkSettings}
                      onSubmit={this.updateWidgetList}
                      {...formProps}
      />
    )
  }

  renderNewWidgetForm(listProps) {
    let FormWrapper
    if ('formWrapper' in this.props) {
      FormWrapper = this.props.formWrapper
    } else {
      FormWrapper = this.state.widgetFrameworkSettings.defaultFormWrapper
    }
    return (
      <FormWrapper {...this.makePassThroughProps()}
                   {...listProps}
                   renderForm={(formProps) => this.renderNewWidgetFormBody(formProps)}
      />
    )
  }

  renderNewWidgetFormBody(formProps) {
    return (
      <NewWidgetForm widgetListId={this.props.widgetListId}
                     listLength={this.state.widgetInstances.length}
                     widgetFrameworkSettings={this.state.widgetFrameworkSettings}
                     onSubmit={this.updateWidgetList}
                     {...formProps}
      />
    )
  }

  render() {
    /**
     * Render list of WidgetDisplays with overhead buttons enabling editing and WidgetForm generation
     */
    if (this.state.widgetFrameworkSettings.disableWidgetFramework) {
      return null
    } else if (this.state.widgetInstances === null) {
      return (this.state.widgetFrameworkSettings.loader)
    } else {
      return (
        <div className={'widget-sidebar container bg-secondary rounded'}>
          {this.renderWidgetList()}
        </div>
      )
    }
  }
}

export default WidgetList
