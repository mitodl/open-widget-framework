import React, {Component} from 'react'
import {fetchJsonData, apiPath} from './utils'
import WidgetForm from './widget-form'


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
      widgetInstances: null,
    }
    this.updateWidgetList = this.updateWidgetList.bind(this)
    this.closeForm = this.closeForm.bind(this)
    this.submitWidgetForm = this.submitWidgetForm.bind(this)
    this.openEditWidgetForm = this.openEditWidgetForm.bind(this)
    this.toggleEditMode = this.toggleEditMode.bind(this)
    this.moveWidget = this.moveWidget.bind(this)
    this.deleteWidget = this.deleteWidget.bind(this)
    this.openNewWidgetForm = this.openNewWidgetForm.bind(this)
    this.makePassThroughProps = this.makePassThroughProps.bind(this)
    this.renderWidgetList = this.renderWidgetList.bind(this)
    this.renderListBody = this.renderListBody.bind(this)
    this.renderWidget = this.renderWidget.bind(this)
    this.renderWidgetBody = this.renderWidgetBody.bind(this)
    this.renderWidgetForm = this.renderWidgetForm.bind(this)
  }

  componentDidMount() {
    /**
     * Fetch data on widget instances in list from fetchRoute
     */
    fetchJsonData(apiPath('widget_list', this.props.widgetListId), this.updateWidgetList)
  }

  componentDidUpdate(prevProps) {
    /**
     * Fetch new widgets when url changes
     */
    if (prevProps.widgetListId !== this.props.widgetListId) {
      fetchJsonData(apiPath('widget_list', this.props.widgetListId), this.updateWidgetList)
      this.setState({editModeActive: false})
    }
  }

  updateWidgetList(data) {
    this.setState({widgetInstances: data})
  }

  closeForm() {
    this.setState({
      retrieveFormRoute: null,
      submitFormMethod: null,
      submitFormRoute: null,
    })
  }

  submitWidgetForm(data) {
    this.updateWidgetList(data)
    this.closeForm()
  }

  // TODO: Make a separate component
  openEditWidgetForm(widgetId) {
    this.closeForm()
    this.setState({
      retrieveFormRoute: apiPath('widget', this.props.widgetListId, widgetId),
      submitFormMethod: 'PUT',
      submitFormRoute: apiPath('widget', this.props.widgetListId, widgetId),
    })
  }

  toggleEditMode() {
    this.setState({editModeActive: !this.state.editModeActive})
    this.closeForm()
  }

  // TODO: Make a separate component
  openNewWidgetForm() {
    this.setState({
      retrieveFormRoute: apiPath('get_configurations'),
      submitFormMethod: 'POST',
      submitFormRoute: apiPath('widget', this.props.widgetListId),
    })
  }

  deleteWidget(widgetId) {
    /**
     * Make request to server to delete widget
     */
    fetchJsonData(apiPath('widget', this.props.widgetListId, widgetId), this.updateWidgetList, {method: 'DELETE'})
  }

  moveWidget(widgetId, position) {
    /**
     * Make request to server to move widget up
     */
    fetchJsonData(apiPath('widget', this.props.widgetListId, widgetId, {position: position}),
                  this.updateWidgetList, {method: 'PATCH'})
  }

  makePassThroughProps(widgetInstance) {
    let passThroughProps = {
      deleteWidget: this.deleteWidget,
      editModeActive: this.state.editModeActive,
      listLength: this.state.widgetInstances.length,
      moveWidget: this.moveWidget,
      openEditWidgetForm: this.openEditWidgetForm,
      openNewWidgetForm: this.openNewWidgetForm,
      renderList: this.renderListBody,
      renderWidget: this.renderWidgetBody,
      renderWidgetForm: this.renderWidgetForm,
      toggleEditMode: this.toggleEditMode,
      widgetListId: this.props.widgetListId,
    }
    if (widgetInstance !== undefined) {
      passThroughProps = Object.assign(passThroughProps, {
        deleteWidget: () => this.deleteWidget(widgetInstance.id),
        moveWidget: (position) => this.moveWidget(widgetInstance.id, position),
        openEditWidgetForm: () => this.openEditWidgetForm(widgetInstance.id),
        renderWidget: () => this.renderWidgetBody(widgetInstance.widgetProps),
      })
    }

    return passThroughProps
  }

  renderWidgetList() {
    let ListWrapper
    if ('listWrapper' in this.props) {
      ListWrapper = this.props.listWrapper
    } else {
      ListWrapper = window.widgetFrameworkSettings.defaultListWrapper
    }
    return (
      <ListWrapper {...this.makePassThroughProps()}
                   {...this.props.listWrapperProps}
      />
    )
  }

  renderListBody() {
    return (
      this.state.widgetInstances.map(widgetInstance => this.renderWidget(widgetInstance))
    )
  }

  renderWidget(widgetInstance) {
    let WidgetWrapper
    if ('widgetWrapper' in this.props) {
      WidgetWrapper = this.props.widgetWrapper
    } else {
      WidgetWrapper = window.widgetFrameworkSettings.defaultWidgetWrapper
    }
    return (
      <WidgetWrapper key={widgetInstance.id}
                     {...widgetInstance}
                     {...this.makePassThroughProps(widgetInstance)}
                     {...this.props.widgetWrapperProps}
      />
    )
  }

  renderWidgetBody(widgetProps) {
    const Renderer = window.widgetFrameworkSettings.renderers[widgetProps.reactRenderer]
      || window.widgetFrameworkSettings.defaultRenderer
    return (
      <Renderer {...widgetProps}/>
    )
  }

  renderWidgetForm(postSubmit) {
    if (this.state.retrieveFormRoute === null) {
      return null
    } else {
      return (
        <WidgetForm csrfToken={window.csrfToken}
                    fetchRoute={this.state.retrieveFormRoute}
                    onCancel={this.closeForm}
                    onSubmit={(data) => { this.submitWidgetForm(data); postSubmit() }}
                    submitMethod={this.state.submitFormMethod}
                    submitUrl={this.state.submitFormRoute}
                    widgetList={this.props.widgetListId}
        />
      )
    }
  }

  render() {
    /**
     * Render list of WidgetDisplays with overhead buttons enabling editing and WidgetForm generation
     */
    if (window.widgetFrameworkSettings.disableWidgetFramework) {
      return null
    } else if (this.state.widgetInstances === null) {
      return (window.widgetFrameworkSettings.loader)
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
