import React, {Component} from 'react'
import Octicon from 'react-component-octicons'

class _defaultFormWrapper extends Component {
  /**
   * _defaultFormWrapper is a basic wrapper for the widget form component. It handles closing the form after submit
   *    and renders a cancel button
   *
   * Props:
   *    updateWidgetList(data): updates the widget-list with data returned from the form submission
   *    renderForm(props): renders the the widget form with props that overwrite the default props
   *
   * Props (passed by _defaultListWrapper)
   *    closeForm(): closes the widget form
   */

  submitAndClose = (data) => {
    /**
     * submitAndClose takes data, updates the widget-list, and then closes the form. This function will overwrite the
     *    default onSubmit passed by WidgetList which only updates the widget-list
     *
     * inputs:
     *    data: the data returned by the form submission
     */
    const { updateWidgetList, closeForm } = this.props
    updateWidgetList(data)
    closeForm()
  }

  render() {
    const { renderForm, closeForm } = this.props
    return (
      <div className="widget-form card default-form-wrapper">
        {renderForm({onSubmit: this.submitAndClose})}
        <div className="cancel-form-button card-footer">
          <button className="btn btn-danger btn-block widget-form-cancel-btn" onClick={closeForm}>
            Cancel
          </button>
        </div>
      </div>
    )
  }
}

class _defaultListWrapper extends Component {
  /**
   * _defaultListWrapper is a basic wrapper for the widget-list component. It tracks when the user is adding or
   * editing a widget and passes that status down to the widget and form wrappers so that they can render appropriately
   *
   * Props:
   *    renderNewWidgetForm(props): renders a New Widget Form and passes props to the FormWrapper
   *    renderEditWidgetForm(widgetId, props): renders an Edit Widget Form for the widget with id widgetId and
   *      passes props to the FormWrapper
   *    renderList(props): renders the list of widgets, passing props to each widgetWrapper
   */
  state = {
    editMode: false,
    addWidgetForm: false,
    editWidgetForm: null,
  }

  addWidget = () => {
    /**
     * addWidget is the onClick for the addWidgetButton. It sets the state so that a new widget form is rendered
     */
    this.setState({
      editMode: true,
      addWidgetForm: true,
      editWidgetForm: null,
    })
  }

  renderAddWidgetButton = () => {
    /**
     * renderAddWidgetButton creates a button to add a new widget
     */
    return (
      <button className="btn btn-info col add-widget-btn" onClick={this.addWidget}>
        <Octicon name="plus"/>
      </button>
    )
  }

  closeForm = () => {
    /**
     * closeForm sets the state so that no forms are rendered
     */
    this.setState({
      addWidgetForm: false,
      editWidgetForm: null,
    })
  }

  toggleEditMode = () => {
    /**
     * toggleEditMode toggles the value of editMode
     */
    const { editMode } = this.state
    this.setState({
      editMode: !editMode,
      addWidgetForm: false,
      editWidgetForm: null,
    })
  }

  editWidget = (widgetId) => {
    /**
     * editWidget sets the state so that an edit widget form is rendered
     *
     * inputs:
     *    widgetId: the widget to edit
     */
    this.setState({
      editMode: true,
      editWidgetForm: widgetId,
      addWidgetForm: false,
    })
  }

  render() {
    const { addWidgetForm, editWidgetForm, editMode } = this.state
    const { renderNewWidgetForm, renderEditWidgetForm, renderList } = this.props
    return (
      <div className="bg-secondary rounded card default-list-wrapper">
        <div className="edit-widget-list-bar btn-group card-header" role="group">
          <button className={`btn btn-info col edit-widget-list-btn ${editMode ? "active" : ""}`}
                  onClick={this.toggleEditMode}>
            <Octicon name="pencil"/>
          </button>
          {editMode ? this.renderAddWidgetButton() : null}
        </div>
        <div className="card-body">
          {addWidgetForm ? renderNewWidgetForm({closeForm: this.closeForm}) : null}
          {editWidgetForm !== null ? renderEditWidgetForm(editWidgetForm, {closeForm: this.closeForm}) : null}
          {renderList({
            editMode: editMode,
            editWidget: this.editWidget,
          })}
        </div>
      </div>
    )
  }
}

class _defaultLoader extends Component {
  /**
   * _defaultLoader is the default component that shows before data has arrived on an asynchronous request
   */
  render() {
    return (<div className="default-loader">Loading</div>)
  }
}

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

class _defaultWidgetWrapper extends Component {
  /**
   * _defaultWidgetWrapper is a basic wrapper for the widget component. It renders a header bar with edit buttons when
   *    the listWrapper passes editMode = true to it.
   *
   * Props:
   *    id: the id of the widget
   *    position: the position of the widget in the widget-list
   *    listLength: the length of the widget-list
   *    moveWidget(newPosition): moves the widget to newPosition
   *    deleteWidget(): deletes the widget form the widget-list
   *    renderWidget(): renders the body of the widget in appropriate renderer
   *
   * Props (passed by _defaultListWrapper)
   *    editWidget(): renders an edit widget form for the widget
   *    editMode: a boolean indicating whether the edit bar should be rendered or not
   */

  moveWidgetUp = () => {
    /**
     * moveWidgetUp moves the widget up one position. It's an onClick function for the edit bar
     */
    const { moveWidget, position } = this.props
    moveWidget(position - 1)
  }

  moveWidgetDown = () => {
    /**
     * moveWidgetDown moves the widget down one position. It's an onClick function for the edit bar
     */
    const { moveWidget, position } = this.props
    moveWidget(position + 1)
  }

  editWidget = () => {
    /**
     * editWidget activates editMode for the widget. It's an onClick function for the edit bar
     */
    const { editWidget, id } = this.props
    editWidget(id)
  }

  deleteWidget = () => {
    /**
     * deleteWidget deletes the widget. It's an onClick function for the edit bar
     */
    const { deleteWidget } = this.props
    deleteWidget()
  }

  renderEditBar = () => {
    /**
     * renderEditBar renders the edit bar for the widget
     */
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

function _defaultFetchJsonData(url, init) {
  /**
   * _defaultFetchJsonData is the default fetch wrapper to handle sending requests and parsing the returns into json.
   *    It expects a csrf token to by defined on the window for making non-GET requests
   *
   * inputs:
   *    url: the path to make the request to
   *    init: values to set on the request
   */
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
