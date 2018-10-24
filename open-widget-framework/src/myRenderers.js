import React, {Component} from 'react'
import {hot} from 'react-hot-loader'


/**
 * DefaultRenderer is the basic component to render a widget configuration
 *
 * Props:
 *    title: title of the widget
 *    html: inner html of the widget
 */
class DefaultRenderer extends Component {
  render() {
    return (
      <div className={'widget-body card-body'}>
        <h5 className={'widget-title card-title'}>{this.props.title}</h5>
        <div className={'widget-text card-text text-truncate'} dangerouslySetInnerHTML={{__html: this.props.html}}/>
      </div>
    )
  }
}

/**
 * SpecialRenderer is a sample component that shows custom react rendering. It is just a wrapper of DefaultRenderer
 */
class SpecialRenderer extends Component {
  render() {
    return (
      <div>
        <h4 className={'card-header text-info'}>This is rendered with a special react renderer</h4>
        <DefaultRenderer {...this.props}/>
      </div>
    )
  }
}

/**
 * RENDERERS is the list of available renderers for widget configurations
 */
const RENDERERS = {
  DefaultRenderer: DefaultRenderer,
  SpecialRenderer: SpecialRenderer,
}

export default hot(module)(RENDERERS)
