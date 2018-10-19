import {hot} from 'react-hot-loader'
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
  state = {
    editModeActive: false,
    retrieveFormRoute: null,
    submitFormRoute: null,
    widgetInstances: null,
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
    }
  }

  updateWidgetList = (data) => this.setState({widgetInstances: data})

  editWidget = (widgetId) => {null}

  toggleEditMode = () => this.setState({editModeActive: !this.state.editModeActive})

  addWidget = () => this.setState({
    retrieveFormRoute: apiPath('get_configurations'),
    submitFormRoute: apiPath('create_widget', this.props.widgetListId),
  })

  renderWidgetList = () => {
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

  renderListBody = () => {
    return (
      this.state.widgetInstances.map(widgetInstance => this.renderWidget(widgetInstance))
    )
  }

  renderWidget = (widgetInstance) => {
    let WidgetWrapper, widgetWrapperProps
    if ('widgetWrapper' in this.props) {
      WidgetWrapper = this.props.widgetWrapper
      if ('widgetWrapperProps' in this.props) {
        widgetWrapperProps = this.props.widgetWrapperProps
      }
    } else {
      WidgetWrapper = DefaultWidgetWrapper
      widgetWrapperProps = {
        editWidget: this.editWidget,
        widgetListId: this.props.widgetListId,
      }
    }
    return (
      <WidgetWrapper renderWidget={this.renderWidgetBody}
                     widgetInstance={widgetInstance}
                     {...widgetWrapperProps}
      />
    )
  }

  renderWidgetBody = (widgetInstance) => {
    const Renderer = RENDERERS[widgetInstance.props.reactRenderer]
    return (
      <Renderer {...widgetInstance.props}/>
    )
  }

  renderWidgetForm = () => {
    if (this.state.retrieveFormRoute === null) {
      return null
    } else {
      return (
        <WidgetForm csrfToken={window.csrfToken}
                    fetchRoute={this.state.retrieveFormRoute}
                    onSubmit={this.updateWidgetList}
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
  render() {
    return (
      <div>
        <div className={'edit-widget-list-bar btn-group'} role={'group'}>
          <button className={'btn btn-info' + (this.props.editModeActive ? ' active' : '') }
                  onClick={this.props.toggleEditMode}>
            <Octicon name={'pencil'}/>
          </button>
          {this.props.editModeActive ? null : (
            <button className={'btn btn-info'} onClick={this.props.addWidget}>
              <Octicon name={'plus'}/>
            </button>)}
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
  state = {
    first: this.props.widgetInstance.props.position === 0,
    id: this.props.widgetInstance.id,
    last: this.props.widgetInstance.props.position === this.props.listLength - 1,
    position: this.props.widgetInstance.props.position,
  }

  deleteWidget = () => {
    /**
     * Make request to server to delete widget
     */
    fetchJsonData(apiPath('delete_widget', this.props.widgetListId, this.state.id), this.onChange)
  }

  moveWidget = (position) => {
    /**
     * Make request to server to move widget up
     */
    fetchJsonData(apiPath('move_widget', this.props.widgetListId, this.state.id, {position: position}), this.onChange)
  }

  render() {
    return (
      <div className={'widget card mb-3 bg-light'} id={'widget-' + this.state.id}>
        <div className={'edit-widget-bar btn-group card-header'}>
          <button className={'btn btn-info col' + (this.props.first ? ' disabled' : '')}
                  onClick={() => this.state.first ? null : this.moveWidget(this.state.position - 1)}
                  title={'Move widget up'}>
            <Octicon name={'chevron-up'}/>
          </button>
          <button className={'btn btn-info col' + (this.props.last ? ' disabled' : '')}
                  onClick={() => this.state.last ? null : this.moveWidget(this.state.position + 1)}
                  title={'Move widget down'}>
            <Octicon name={'chevron-down'}/>
          </button>
          <button className={'btn btn-info col'} onClick={() => this.props.editWidget(this.state.id)}
                  title={'Update widget'}>
            <Octicon name={'pencil'}/>
          </button>
          <button className={'btn btn-danger col'} onClick={() => this.deleteWidget(this.state.id)}
                  title={'Delete widget'}>
            <Octicon name={'x'}/>
          </button>
        </div>
        {this.props.renderWidget(this.props.widgetInstance)}
      </div>
    )
  }
}

export default WidgetList
