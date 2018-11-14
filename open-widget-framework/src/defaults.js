import React, {Component} from 'react'
import Octicon from 'react-component-octicons'

class _defaultRenderer extends Component {
  /**
   * DefaultRenderer is the basic component to render a widget configuration
   *
   * Props:
   *    title: title of the widget
   *    html: inner html of the widget
   */
  render() {
    return (
      <div className={'widget-body card-body'}>
        <h5 className={'widget-title card-title'}>{this.props.title}</h5>
        <div className={'widget-text card-text text-truncate'} dangerouslySetInnerHTML={{__html: this.props.html}}/>
      </div>
    )
  }
}

class _defaultListWrapper extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editMode: false,
      addWidgetForm: false,
      editWidgetForm: null,
    }
    this.renderAddWidgetButton = this.renderAddWidgetButton.bind(this)
    this.closeForm = this.closeForm.bind(this)
  }

  renderAddWidgetButton() {
    return (
      <button className={'btn btn-info'} onClick={() => this.setState({
        addWidgetForm: !this.state.addWidgetForm,
        editWidgetForm: null,
      })}>
        <Octicon name={'plus'}/>
      </button>
    )
  }

  closeForm() {
    this.setState({
      addWidgetForm: false,
      editWidgetForm: null,
    })
  }

  render() {
    return (
      <div className={'bg-secondary rounded float-right col-lg-4'}>
        {this.state.addWidgetForm ? this.props.renderNewWidgetForm({closeForm: this.closeForm}) : null}
        {this.state.editWidgetForm !== null
          ? this.props.renderEditWidgetForm(this.state.editWidgetForm, {closeForm: this.closeForm}) : null}
        <div className={'edit-widget-list-bar btn-group'} role={'group'}>
          <button className={'btn btn-info' + (this.state.editMode ? ' active' : '') }
                  onClick={() => this.setState({editMode: !this.state.editMode})}>
            <Octicon name={'pencil'}/>
          </button>
          {this.state.editMode ? this.renderAddWidgetButton() : null}
        </div>
        <hr/>
        <div>
          {this.props.renderList({
            editMode: this.state.editMode,
            editWidget: widgetId => this.setState({
              editWidgetForm: widgetId,
              addWidgetForm: false,
            }),
          })}
        </div>
      </div>
    )
  }
}

class _defaultWidgetWrapper extends Component {
  constructor(props) {
    super(props)
    this.renderEditBar = this.renderEditBar.bind(this)
  }

  renderEditBar() {
    return (
      <div className={'edit-widget-bar btn-group card-header'}>
        <button className={'btn btn-info col'}
                disabled={this.props.position === 0}
                onClick={() => this.props.moveWidget(this.props.position - 1)}
                title={'Move widget up'}>
          <Octicon name={'chevron-up'}/>
        </button>
        <button className={'btn btn-info col'}
                disabled={this.props.position === this.props.listLength - 1}
                onClick={() => this.props.moveWidget(this.props.position + 1)}
                title={'Move widget down'}>
          <Octicon name={'chevron-down'}/>
        </button>
        <button className={'btn btn-info col'} onClick={() => this.props.editWidget(this.props.id)}
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
        {this.props.editMode ? this.renderEditBar() : null}
        {this.props.renderWidget()}
      </div>
    )
  }
}


class _defaultFormWrapper extends Component {
  render() {
    return (
      <div className={'widget-form'}>
        {this.props.renderForm({
          onSubmit: data => {
            this.props.updateWidgetList(data)
            this.props.closeForm()
          },
        })}
        <button className={'btn btn-danger btn-block'} onClick={this.props.closeForm}>
          Cancel
        </button>
      </div>
    )
  }
}

const _defaultLoader = <p>Loading</p>

function _defaultFetchJsonData(url, init) {
  if (init !== undefined && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method) && 'headers' in init === false) {
    if (window.csrfToken === undefined) {
      console.error('No csrfToken found on window')
    }
    init.headers = {
      'Content-Type': 'application/json',
      'X-CSRFToken': window.csrfToken,
    }
  }

  return fetch(url, init)
    .then(data => data.json())
}

export {_defaultRenderer, _defaultListWrapper, _defaultWidgetWrapper, _defaultFormWrapper, _defaultLoader, _defaultFetchJsonData}
