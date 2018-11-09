import React, { Component } from "react"
import Octicon from "react-component-octicons"

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
      <div className={"widget-body card-body"}>
        <h5 className={"widget-title card-title"}>{this.props.title}</h5>
        <div
          className={"widget-text card-text text-truncate"}
          dangerouslySetInnerHTML={{ __html: this.props.html }}
        />
      </div>
    )
  }
}

class _defaultListWrapper extends Component {
  renderAddWidgetButton() {
    return (
      <button className={"btn btn-info"} onClick={this.props.openNewWidgetForm}>
        <Octicon name={"plus"} />
      </button>
    )
  }
  render() {
    return (
      <div>
        {this.props.renderWidgetForm()}
        <div className={"edit-widget-list-bar btn-group"} role={"group"}>
          <button
            className={
              `btn btn-info${  this.props.editModeActive ? " active" : ""}`
            }
            onClick={this.props.toggleEditMode}
          >
            <Octicon name={"pencil"} />
          </button>
          {this.props.editModeActive ? this.renderAddWidgetButton() : null}
        </div>
        <hr />
        <div>{this.props.renderList()}</div>
      </div>
    )
  }
}

class _defaultWidgetWrapper extends Component {
  renderEditBar() {
    return (
      <div className={"edit-widget-bar btn-group card-header"}>
        <button
          className={"btn btn-info col"}
          disabled={this.props.position === 0}
          onClick={() => this.props.moveWidget(this.props.position - 1)}
          title={"Move widget up"}
        >
          <Octicon name={"chevron-up"} />
        </button>
        <button
          className={"btn btn-info col"}
          disabled={this.props.position === this.props.listLength - 1}
          onClick={() => this.props.moveWidget(this.props.position + 1)}
          title={"Move widget down"}
        >
          <Octicon name={"chevron-down"} />
        </button>
        <button
          className={"btn btn-info col"}
          onClick={() => this.props.openEditWidgetForm(this.props.id)}
          title={"Update widget"}
        >
          <Octicon name={"pencil"} />
        </button>
        <button
          className={"btn btn-danger col"}
          onClick={() => this.props.deleteWidget(this.props.id)}
          title={"Delete widget"}
        >
          <Octicon name={"x"} />
        </button>
      </div>
    )
  }

  render() {
    return (
      <div
        className={"widget card mb-3 bg-light"}
        id={`widget-${  this.props.id}`}
      >
        {this.props.editModeActive ? this.renderEditBar() : null}
        {this.props.renderWidget()}
      </div>
    )
  }
}

class _defaultFormWrapper extends Component {
  render() {
    return <div className={"widget-form"}>{this.props.renderWidgetForm()}</div>
  }
}

const _defaultLoader = <p>Loading</p>

function _defaultFetchJsonData(url, init) {
  if (
    init !== undefined &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(init.method) &&
    "headers" in init === false
  ) {
    if (window.csrfToken === undefined) {
      console.error("No csrfToken found on window")
    }
    init.headers = {
      "Content-Type": "application/json",
      "X-CSRFToken":  window.csrfToken
    }
  }

  return fetch(url, init).then(data => data.json())
}

export {
  _defaultRenderer,
  _defaultListWrapper,
  _defaultWidgetWrapper,
  _defaultFormWrapper,
  _defaultLoader,
  _defaultFetchJsonData
}
