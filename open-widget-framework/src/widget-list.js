import React, {Component} from 'react'
import RENDERERS from './myRenderers'
import Octicon from 'react-component-octicons'
import {fetchJsonData, apiPath} from './helpers'
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
      submitFormRoute: null,
      widgetInstances: null,
    }
    this.updateWidgetList = this.updateWidgetList.bind(this)
    this.closeForm = this.closeForm.bind(this)
    this.submitWidgetForm = this.submitWidgetForm.bind(this)
    this.editWidget = this.editWidget.bind(this)
    this.toggleEditMode = this.toggleEditMode.bind(this)
    this.addWidget = this.addWidget.bind(this)
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
    fetchJsonData(apiPath('get_list', this.props.widgetListId), this.updateWidgetList)
  }

  componentDidUpdate(prevProps) {
    /**
     * Fetch new widgets when url changes
     */
    if (prevProps.widgetListId !== this.props.widgetListId) {
      fetchJsonData(apiPath('get_list', this.props.widgetListId), this.updateWidgetList)
      this.setState({editModeActive: false})
    }
  }

  updateWidgetList(data) {
    this.setState({widgetInstances: data})
  }

  closeForm() {
    this.setState({
      retrieveFormRoute: null,
      submitFormRoute: null,
    })
  }

  submitWidgetForm(data) {
    this.updateWidgetList(data)
    this.closeForm()
  }

  editWidget(widgetId) {
    this.closeForm()
    this.setState({
      retrieveFormRoute: apiPath('get_widget', this.props.widgetListId, widgetId),
      submitFormRoute: apiPath('update_widget', this.props.widgetListId, widgetId),
    })
  }

  toggleEditMode() {
    this.setState({editModeActive: !this.state.editModeActive})
    this.closeForm()
  }

  addWidget() {
    this.setState({
      retrieveFormRoute: apiPath('get_configurations'),
      submitFormRoute: apiPath('create_widget', this.props.widgetListId),
    })
  }

  renderWidgetList() {
    let ListWrapper, listWrapperProps
    if ('listWrapper' in this.props) {
      ListWrapper = this.props.listWrapper
      if ('listWrapperProps' in this.props) {
        listWrapperProps = this.props.listWrapperProps
      }
    } else {
      ListWrapper = DefaultListWrapper
      listWrapperProps = {
        addWidget: this.addWidget,
        editModeActive: this.state.editModeActive,
        toggleEditMode: this.toggleEditMode,
      }
    }

    return (
      <ListWrapper renderList={this.renderListBody}
                   widgetListId={this.props.widgetListId}
                   {...listWrapperProps}
      />
    )
  }

  renderListBody() {
    return (
      this.state.widgetInstances.map(widgetInstance => this.renderWidget(widgetInstance))
    )
  }

  renderWidget(widgetInstance) {
    let WidgetWrapper, widgetWrapperProps
    if ('widgetWrapper' in this.props) {
      WidgetWrapper = this.props.widgetWrapper
      if ('widgetWrapperProps' in this.props) {
        widgetWrapperProps = this.props.widgetWrapperProps
      }
    } else {
      WidgetWrapper = DefaultWidgetWrapper
      widgetWrapperProps = {
        editModeActive: this.state.editModeActive,
        editWidget: this.editWidget,
        onChange: this.updateWidgetList,
        widgetListId: this.props.widgetListId,
      }
    }
    return (
      <WidgetWrapper key={widgetInstance.id}
                     listLength={this.state.widgetInstances.length}
                     renderWidget={this.renderWidgetBody}
                     {...widgetInstance}
                     {...widgetWrapperProps}
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
          {this.renderWidgetForm()}
          <hr/>
          {this.renderWidgetList()}
        </div>
      )
    }
  }
}

class DefaultListWrapper extends Component {
  renderAddWidgetButton() {
    return (
      <button className={'btn btn-info'} onClick={this.props.addWidget}>
        <Octicon name={'plus'}/>
      </button>
    )
  }
  render() {
    return (
      <div>
        <div className={'edit-widget-list-bar btn-group'} role={'group'}>
          <button className={'btn btn-info' + (this.props.editModeActive ? ' active' : '') }
                  onClick={this.props.toggleEditMode}>
            <Octicon name={'pencil'}/>
          </button>
          {this.props.editModeActive ? this.renderAddWidgetButton() : null}
        </div>
        <hr/>
        <div>
          {this.props.renderList(this.props.widgetInstances)}
        </div>
      </div>
    )
  }
}

class DefaultWidgetWrapper extends Component {
  deleteWidget() {
    /**
     * Make request to server to delete widget
     */
    fetchJsonData(apiPath('delete_widget', this.props.widgetListId, this.props.id), this.props.onChange)
  }

  moveWidget(position) {
    /**
     * Make request to server to move widget up
     */
    fetchJsonData(apiPath('move_widget', this.props.widgetListId, this.props.id, {position: position}),
                  this.props.onChange)
  }

  renderEditBar() {
    return (
      <div className={'edit-widget-bar btn-group card-header'}>
        <button className={'btn btn-info col'}
                disabled={this.props.position === 0}
                onClick={() => this.moveWidget(this.props.position - 1)}
                title={'Move widget up'}>
          <Octicon name={'chevron-up'}/>
        </button>
        <button className={'btn btn-info col'}
                disabled={this.props.position === this.props.listLength - 1}
                onClick={() => this.moveWidget(this.props.position + 1)}
                title={'Move widget down'}>
          <Octicon name={'chevron-down'}/>
        </button>
        <button className={'btn btn-info col'} onClick={() => this.props.editWidget(this.props.id)}
                title={'Update widget'}>
          <Octicon name={'pencil'}/>
        </button>
        <button className={'btn btn-danger col'} onClick={() => this.deleteWidget(this.props.id)}
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
        {this.props.renderWidget(this.props.widgetProps)}
      </div>
    )
  }
}

export default WidgetList
