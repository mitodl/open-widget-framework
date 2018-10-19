import {hot} from 'react-hot-loader'
import React, {Component} from 'react'
import {Link, Route} from 'react-router-dom'
import RENDERERS from './myRenderers'
import WidgetForm from './widget-form'
import Octicon from 'react-component-octicons'


/**
 * WidgetList is a list of rendered widgets
 *
 * Props:
 *    fetchRoute: where to fetch widgets in list from
 */
class WidgetList extends Component {
  state = {widgetInstances: null}

  componentDidMount() {
    /**
     * Fetch data on widget instances in list from fetchRoute
     */
    fetch(this.props.fetchRoute)
      .then(data => {
        return data.json()
      })
      .then(jsonData => {
        this.setState({widgetInstances: jsonData})
      })
      .catch(error => console.error(error))
  }

  componentDidUpdate(prevProps) {
    /**
     * Fetch new widgets when url changes
     */
    if (prevProps.fetchRoute !== this.props.fetchRoute) {
      this.componentDidMount()
    }
  }

  onChange = (jsonData) => {
    /**
     * Update current widget instances on any edits to widget list
     */
    this.setState({widgetInstances: jsonData})
  }

  render() {
    /**
     * Render list of WidgetDisplays with overhead buttons enabling editing and WidgetForm generation
     */
    if (this.state.widgetInstances === null) {
      return (<p>Loading</p>)
    } else {
      return (
        <div className={'widget-list container bg-secondary rounded'}>
          <Route exact path='/list/:listId' render={({match}) => (
            <Link className={'edit-widget-link btn btn-primary'}
                  to={'/list/' + match.params.listId + '/edit'}>
              Edit widget list
            </Link>
          )}/>
          <Route path='/list/:listId/edit' render={({match}) => (
            <Link className={'edit-widget-link btn btn-primary active'}
                  to={'/list/' + match.params.listId}>
              Finish editing
            </Link>
          )}/>
          <Route exact path='/list/:listId/edit' render={({match}) => (
            <Link className={'add-widget-link btn btn-success float-right'}
                  to={'/list/' + match.params.listId + '/edit/add'}>
              Add widget to list
            </Link>
          )}/>
          <Route exact path='/list/:listId/edit/add' render={({match, history}) => (
            <div className={'mt-3'}>
              <WidgetForm {...this.props}
                          csrfToken={window.csrfToken}
                          editWidget={false}
                          fetchRoute={this.props.configurationsUrl}
                          formDidSubmit={jsonData => {
                            this.onChange(jsonData)
                            history.push('/list/' + match.params.listId + '/edit')
                          }}
                          submitUrl={this.props.apiUrl + 'widget/create'}
                          widgetList={match.params.listId}/>
            </div>
          )}/>
          <Route path='/list/:listId/edit/:widgetId([0-9]+)' render={({match, history}) => (
            <div className={'mt-3'}>
              <WidgetForm {...this.props}
                          csrfToken={window.csrfToken}
                          editWidget={true}
                          fetchRoute={this.props.apiUrl + 'widget/' + match.params.widgetId}
                          formDidSubmit={jsonData => {
                            this.onChange(jsonData)
                            history.push('/list/' + match.params.listId + '/edit')
                          }}
                          submitUrl={this.props.apiUrl + 'widget/' + match.params.widgetId + '/update'}
                          widgetList={match.params.listId}
                          widgetToEdit={match.params.widgetId}/>
            </div>
          )}/>

          <hr/>
          <div className={'widgets'}>
            {this.state.widgetInstances.map(
              (widgetInstance) => <WidgetDisplay
                deleteUrl={this.props.apiUrl + 'widget/' + widgetInstance.id + '/delete'}
                first={widgetInstance.props.position === 0}
                id={widgetInstance.id}
                key={widgetInstance.id.toString()}
                last={widgetInstance.props.position
                  === this.state.widgetInstances.length - 1}
                onChange={this.onChange}
                repositionUrl={
                  this.props.apiUrl + 'widget/' + widgetInstance.id + '/move'}
                {...widgetInstance.props}/>
            )}
          </div>
        </div>
      )
    }
  }
}

/**
 * WidgetDisplay is a single rendered widget
 *
 * Props:
 *    deleteUrl: api endpoint for widget delete
 *    first: true if widget is the first in the list
 *    id: unique widget id matching django object id
 *    key: unique key for react rendering
 *    last: true if widget is last in the list
 *    onChange: what to do after a successful widget edit
 *    repositionUrl: api endpoint for widget reposition
 */
class WidgetDisplay extends Component {
  deleteWidget = () => {
    /**
     * Make request to server to delete widget
     */
    fetch(this.props.deleteUrl)
      .then(data => { return data.json() })
      .then(this.props.onChange)
      .catch((error) => { console.error(error) })
  }

  moveWidgetUp = () => {
    /**
     * Make request to server to move widget up
     */
    fetch(this.props.repositionUrl + '?position=' + (this.props.position - 1))
      .then(data => { return data.json() })
      .then(this.props.onChange)
      .catch((error) => { console.error(error) })
  }

  moveWidgetDown = () => {
    /**
     * Make request to server to move widget down
     */
    fetch(this.props.repositionUrl + '?position=' + (this.props.position + 1))
      .then(data => { return data.json() })
      .then(this.props.onChange)
      .catch((error) => { console.error(error) })
  }

  render() {
    /**
     * Render widget using reactRenderer specified on widget configuration or defaultRenderer along with edit button
     * panel if editing is engaged
     */
    const Renderer = RENDERERS[this.props.reactRenderer]
    return (
      <div className={'widget card mb-3 bg-light'} id={'widget-' + this.props.id}>
        <Route path={'/list/:listId/edit'} render={({match}) =>
          <div className={'edit-widget-bar btn-group card-header'}>
            <button className={'btn btn-info col' + (this.props.first ? ' disabled' : '')}
                    onClick={this.props.first ? null : this.moveWidgetUp} title={'Move widget up'}>
              <Octicon name={'chevron-up'}/>
            </button>
            <button className={'btn btn-info col' + (this.props.last ? ' disabled' : '')}
                    onClick={this.props.last ? null : this.moveWidgetDown} title={'Move widget down'}>
              <Octicon name={'chevron-down'}/>
            </button>
            <Link className={'btn btn-info col'} title={'Edit widget'}
                  to={'/list/' + match.params.listId + '/edit/' + this.props.id}>
              <Octicon name={'pencil'}/>
            </Link>
            <button className={'btn btn-danger col'} onClick={this.deleteWidget} title={'Delete widget'}>
              <Octicon name={'x'}/>
            </button>
          </div>
        }/>
        <Renderer {...this.props}/>
        <br/>
      </div>
    )
  }
}

export default hot(module)(WidgetList)
