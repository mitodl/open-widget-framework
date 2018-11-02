import React, {Component} from 'react'
import RENDERERS from './myRenderers'
import Octicon from 'react-component-octicons'
import {fetchJsonData, apiPath} from './utils'
import WidgetForm from './widget-form'


/**
 * WidgetList is a list of rendered widgets
 *
 * Props:
 *    fetchRoute: where to fetch widgets in list from
 */
class WidgetList extends Component {
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
        deleteWidget: () => this.deleteWidget(widgetInstance),
        moveWidget: (position) => this.moveWidget(widgetInstance, position),
        renderWidget: () => this.renderWidgetBody(widgetInstance.widgetProps),
      })
    }

    return passThroughProps
  }

  renderWidgetList() {
    let ListWrapper, listWrapperProps
    if ('listWrapper' in this.props) {
      ListWrapper = this.props.listWrapper
    } else {
      ListWrapper = DefaultListWrapper
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
      WidgetWrapper = DefaultWidgetWrapper
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
    const Renderer = RENDERERS[widgetProps.reactRenderer]
    return (
      <Renderer {...widgetProps}/>
    )
  }

  renderWidgetForm() {
    if (this.state.retrieveFormRoute === null) {
      return null
    } else {
      return (
        <WidgetForm csrfToken={window.csrfToken}
                    fetchRoute={this.state.retrieveFormRoute}
                    onCancel={this.closeForm}
                    onSubmit={this.submitWidgetForm}
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
    if (this.state.widgetInstances === null) {
      return (<p>Loading</p>)
    } else {
      return (
        <div className={'widget-sidebar container bg-secondary rounded'}>
          {this.renderWidgetList()}
        </div>
      )
    }
  }
}

class DefaultListWrapper extends Component {
  renderAddWidgetButton() {
    return (
      <button className={'btn btn-info'} onClick={this.props.openNewWidgetForm}>
        <Octicon name={'plus'}/>
      </button>
    )
  }
  render() {
    return (
      <div>
        {this.props.renderWidgetForm()}
        <div className={'edit-widget-list-bar btn-group'} role={'group'}>
          <button className={'btn btn-info' + (this.props.editModeActive ? ' active' : '') }
                  onClick={this.props.toggleEditMode}>
            <Octicon name={'pencil'}/>
          </button>
          {this.props.editModeActive ? this.renderAddWidgetButton() : null}
        </div>
        <hr/>
        <div>
          {this.props.renderList()}
        </div>
      </div>
    )
  }
}

class DefaultWidgetWrapper extends Component {
  renderEditBar() {
    return (
      <div className={'edit-widget-bar btn-group card-header'}>
        <button className={'btn btn-info col'}
                disabled={this.props.position === 0}
                onClick={() => this.props.moveWidget(this.props.id, this.props.position - 1)}
                title={'Move widget up'}>
          <Octicon name={'chevron-up'}/>
        </button>
        <button className={'btn btn-info col'}
                disabled={this.props.position === this.props.listLength - 1}
                onClick={() => this.props.moveWidget(this.props.id, this.props.position + 1)}
                title={'Move widget down'}>
          <Octicon name={'chevron-down'}/>
        </button>
        <button className={'btn btn-info col'} onClick={() => this.props.openEditWidgetForm(this.props.id)}
                title={'Update widget'}>
          <Octicon name={'pencil'}/>
        </button>
        <button className={'btn btn-danger col'} onClick={() => this.props.deleteWidget(this.props.id)}
                title={'Delete widget'}>
          <Octicon name={'x'}/>
        </button>
      </div>
    )
  }

  render() {
    return (
      <div className={'widget card mb-3 bg-light'} id={'widget-' + this.props.id}>
        {this.props.editModeActive ? this.renderEditBar() : null}
        {this.props.renderWidget()}
      </div>
    )
  }
}

export default WidgetList
