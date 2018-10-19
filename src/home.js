import {hot} from 'react-hot-loader'
import React, {Component} from 'react'
import {BrowserRouter as Router, Link, Route} from 'react-router-dom'
import Octicon from 'react-component-octicons'
import WidgetList from './widget-list'

import {fetchJsonData, apiPath} from './helpers'

/**
 * Home is the home page of the sample widget-framework app. It renders a list of widget lists and one specified
 * widget list
 *
 * Props:
 *    fetchRoute: where to widget lists from
 *    baseUrl: the base url to build api endpoints off of
 */
class Home extends Component {
  state = {
    widgetLists: null,
  }

  componentDidMount() {
    /**
     * Fetch data on widget lists from fetchRoute
     */
    fetchJsonData(apiPath('get_lists'), this.updateLists)
  }

  updateLists = (data) => this.setState({widgetLists: data.map(obj => obj.id)})

  addList = () => {
    /**
     * Make request to create new widget list
     */
    fetchJsonData(apiPath('create_list'), this.updateLists)
  }

  deleteList = (listId) => {
    /**
     * Make request to delete widget list
     */
    fetchJsonData(apiPath('delete_list', listId), this.updateLists)
  }

  render() {
    /**
     * Render background list of available widget lists and one WidgetList specified in the route using react-router
     */
    if (this.state.widgetLists === null) {
      return (<p>Loading</p>)
    } else {
      return (
        <Router>
          <div className={'widget-home'}>
            <Route path='/list/:widgetListId' render={({match}) => (
              <WidgetList widgetListId={match.params.widgetListId}/>
            )}/>
            <div className={'widget-list-navigator container'}>
              <Link className={'btn btn-link mt-3'} to='/'>Home</Link>
              <hr/>

              <h2>Widget Lists</h2>
              <ul className={'mt-3'}>
                {this.state.widgetLists.map(
                  (widgetListId) => <li className={''} key={widgetListId}>
                    <Link to={'/list/' + widgetListId}>Widget List {widgetListId}</Link>
                    <span className={'btn text-danger'} onClick={() => this.deleteList(widgetListId)}>
                      <Octicon name={'x'}/>
                    </span>
                  </li>
                )}
                <li className={'btn text-success'} onClick={this.addList}>Add new widget list</li>
              </ul>
            </div>
          </div>
        </Router>
      )
    }
  }
}

export default hot(module)(Home)
