import React from 'react'
import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallow } from 'enzyme'

import WidgetList from '../src/widget_list'
import { _defaultWidgetWrapper, _defaultListWrapper} from '../src/defaults'
import { mockFetchData, mockWidgetInstances } from './test_utils'

describe('<WidgetList />', () => {
  const propsOne = {widgetFrameworkSettings: {fetchData: mockFetchData(mockWidgetInstances(3))}}
  sinon.spy(WidgetList.prototype, 'componentDidMount')

  it('sets widgetInstances with fetch in component did mount', (done) => {
    const wrap = mount(<WidgetList {...propsOne}/>)
    expect(WidgetList.prototype.componentDidMount.calledOnce).to.equal(true)
    setImmediate(() => {
      expect(wrap.state('widgetInstances')).to.have.lengthOf(3)
      done()
    })
  })

  it('renders a widget list wrapper', (done) => {
    const wrap = mount(<WidgetList {...propsOne}/>)
    setImmediate(() => {
      console.log(wrap.debug())
      expect(wrap.find(_defaultListWrapper)).to.have.lengthOf(3)
      done()
    })
  })
})
