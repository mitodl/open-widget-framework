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
    const { title, html } = this.props
    return (
      <div className="widget-body card-body">
        <h5 className="widget-title card-title">{title}</h5>
        <div className="widget-text card-text text-truncate" dangerouslySetInnerHTML={{__html: html}}/>
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
    this.toggleEditMode = this.toggleEditMode.bind(this)
    this.editWidget = this.editWidget.bind(this)
    this.addWidget = this.addWidget.bind(this)
  }

  addWidget() {
    const { addWidgetForm } = this.state
    this.setState({
      addWidgetForm: !addWidgetForm,
      editWidgetForm: null,
    })
  }

  renderAddWidgetButton() {
    return (
      <button className="btn btn-info col" onClick={this.addWidget}>
        <Octicon name="plus"/>
      </button>
    )
  }

  closeForm() {
    this.setState({
      addWidgetForm: false,
      editWidgetForm: null,
    })
  }

  toggleEditMode() {
    const { editMode } = this.state
    this.setState({editMode: !editMode})
    this.closeForm()
  }

  editWidget(widgetId) {
    this.setState({
      editWidgetForm: widgetId,
      addWidgetForm: false,
    })
  }

  render() {
    const { addWidgetForm, editWidgetForm, editMode } = this.state
    const { renderNewWidgetForm, renderEditWidgetForm } = this.props
    return (
      <div className="bg-secondary rounded card">
        <div className="edit-widget-list-bar btn-group card-header" role="group">
          <button className={`btn btn-info col ${editMode ? "active" : ""}`} onClick={this.toggleEditMode}>
            <Octicon name="pencil"/>
          </button>
          {editMode ? this.renderAddWidgetButton() : null}
        </div>
        <div className="card-body">
          {addWidgetForm ? renderNewWidgetForm({closeForm: this.closeForm}) : null}
          {editWidgetForm !== null ? renderEditWidgetForm(editWidgetForm, {closeForm: this.closeForm}) : null}
          {this.props.renderList({
            editMode: editMode,
            editWidget: this.editWidget,
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
    this.moveWidgetUp = this.moveWidgetUp.bind(this)
    this.moveWidgetDown = this.moveWidgetDown.bind(this)
    this.editWidget = this.editWidget.bind(this)
    this.deleteWidget = this.deleteWidget.bind(this)
  }

  moveWidgetUp() {
    const { moveWidget, position } = this.props
    moveWidget(position - 1)
  }

  moveWidgetDown() {
    const { moveWidget, position } = this.props
    moveWidget(position + 1)
  }

  editWidget() {
    const { editWidget, id } = this.props
    editWidget(id)
  }

  deleteWidget() {
    const { deleteWidget, id } = this.props
    deleteWidget(id)
  }

  renderEditBar() {
    const { position, listLength } = this.props
    return (
      <div className="edit-widget-bar btn-group card-header">
        <button className="btn btn-info col" disabled={position === 0}
                onClick={this.moveWidgetUp} title="Move widget up">
          <Octicon name="chevron-up"/>
        </button>
        <button className="btn btn-info col" disabled={position === listLength - 1}
                onClick={this.moveWidgetDown} title="Move widget down">
          <Octicon name="chevron-down"/>
        </button>
        <button className="btn btn-info col" onClick={this.editWidget} title="Update widget">
          <Octicon name="pencil"/>
        </button>
        <button className="btn btn-danger col" onClick={this.deleteWidget} title="Delete widget">
          <Octicon name="x"/>
        </button>
      </div>
    )
  }

  render() {
    const { editMode, renderWidget, id } = this.props
    return (
      <div className="widget card bg-light" id={`widget-${id}`}>
        {editMode ? this.renderEditBar() : null}
        {renderWidget()}
      </div>
    )
  }
}


class _defaultFormWrapper extends Component {
  constructor(props) {
    super(props)
    this.submitAndClose = this.submitAndClose.bind(this)
  }

  submitAndClose(data) {
    const { updateWidgetList, closeForm } = this.props
    updateWidgetList(data)
    closeForm()
  }

  render() {
    const { renderForm, closeForm } = this.props
    return (
      <div className="widget-form card">
        {renderForm({
          onSubmit: this.submitAndClose,
          className: "card-body"
        })}
        <div className="cancel-form-button card-footer">
          <button className="btn btn-danger btn-block" onClick={closeForm}>
            Cancel
          </button>
        </div>
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

export {
  _defaultRenderer,
  _defaultListWrapper,
  _defaultWidgetWrapper,
  _defaultFormWrapper,
  _defaultLoader,
  _defaultFetchJsonData}
