import React from 'react'
import { expect } from 'chai'
import sinon from 'sinon'
import { mount } from 'enzyme'

import {
  _defaultFetchJsonData as fetchData,
  _defaultWidgetWrapper as WidgetWrapper,
  _defaultListWrapper as ListWrapper,
  _defaultFormWrapper as FormWrapper,
  _defaultRenderer as Renderer,
  _defaultLoader as Loader,
} from '../src/defaults'

describe('_defaultFetchJsonData', () => {
  const dummyUrl = "some.dummy.url"
  const dummyPostInit = {
    method: 'POST',
  }
  // TODO: implement
})

describe('<_defaultFormWrapper />', () => {
  const dummyData = {data: 'dummyData'}
  const dummyProps = {
    updateWidgetList: sinon.spy(),
    renderForm: sinon.spy(),
    closeForm: sinon.spy(),
  }

  const resetSpyHistory = () => {
    dummyProps.updateWidgetList.resetHistory()
    dummyProps.renderForm.resetHistory()
    dummyProps.closeForm.resetHistory()
  }

  // Method tests:
  it('calls only renderForm by default', () => {
    const wrap = mount(<FormWrapper {...dummyProps}/>)

    expect(dummyProps.renderForm.callCount).to.equal(1)
    expect(dummyProps.updateWidgetList.callCount).to.equal(0)
    expect(dummyProps.closeForm.callCount).to.equal(0)
  })

  it('submitAndClose only renderForm by default', () => {
    resetSpyHistory()
    const wrap = mount(<FormWrapper {...dummyProps}/>)

    const instance = wrap.instance()
    instance.submitAndClose(dummyData)

    expect(dummyProps.renderForm.callCount).to.equal(1)
    expect(dummyProps.updateWidgetList.withArgs(dummyData).callCount).to.equal(1)
    expect(dummyProps.closeForm.callCount).to.equal(1)
  })

  // Click event tests:
  it('cancel button calls closeForm', () => {
    resetSpyHistory()
    const wrap = mount(<FormWrapper {...dummyProps}/>)
    expect(wrap.exists('.widget-form-cancel-btn')).to.equal(true)
    wrap.find('.widget-form-cancel-btn').simulate('click')

    expect(dummyProps.renderForm.callCount).to.equal(1)
    expect(dummyProps.updateWidgetList.callCount).to.equal(0)
    expect(dummyProps.closeForm.callCount).to.equal(1)
  })

})

describe('<_defaultListWrapper />', () => {
  const dummyId = 3
  const dummyProps = {
    renderNewWidgetForm: sinon.spy(),
    renderEditWidgetForm: sinon.spy(),
    renderList: sinon.spy(),
  }

  const resetSpyHistory = (wrap) => {
    dummyProps.renderNewWidgetForm.resetHistory()
    dummyProps.renderEditWidgetForm.resetHistory()
    dummyProps.renderList.resetHistory()
  }

  // Method + state tests: Ensure that methods set state appropriately or return well-formed sub-components
  it('sets default state appropriately', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)

    expect(wrap.state('editMode')).to.equal(false)
    expect(wrap.state('addWidgetForm')).to.equal(false)
    expect(wrap.state('editWidgetForm')).to.equal(null)
  })

  it('addWidget sets addWidgetForm to true ', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    instance.addWidget()
    wrap.update()

    expect(wrap.state('addWidgetForm')).to.equal(true)
    expect(wrap.state('editWidgetForm')).to.equal(null)
    expect(wrap.state('editMode')).to.equal(true)
  })

  it('renderAddWidgetButton returns an add-widget-btn', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    const btn = mount(instance.renderAddWidgetButton())

    expect(btn.exists('.add-widget-btn')).to.equal(true)
  })

  it('closeForm sets addWidgetForm to false and editWidgetForm to null', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    wrap.setState({
      addWidgetForm: true,
      editWidgetForm: 3,
    })

    const instance = wrap.instance()
    instance.closeForm()

    expect(wrap.state('editMode')).to.equal(false)
    expect(wrap.state('addWidgetForm')).to.equal(false)
    expect(wrap.state('editWidgetForm')).to.equal(null)
  })

  it('toggleEditMode toggles the editMode in state', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    instance.toggleEditMode()

    expect(wrap.state('editMode')).to.equal(true)
    expect(wrap.state('addWidgetForm')).to.equal(false)
    expect(wrap.state('editWidgetForm')).to.equal(null)

    instance.toggleEditMode()

    expect(wrap.state('editMode')).to.equal(false)
    expect(wrap.state('addWidgetForm')).to.equal(false)
    expect(wrap.state('editWidgetForm')).to.equal(null)
  })

  it('editWidget sets editWidgetForm to an id', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    const dummyId = 3
    instance.editWidget(dummyId)

    expect(wrap.state('editWidgetForm')).to.equal(dummyId)
    expect(wrap.state('addWidgetForm')).to.equal(false)
    expect(wrap.state('editMode')).to.equal(true)

    instance.editWidget(dummyId + 1)

    expect(wrap.state('editWidgetForm')).to.equal(dummyId + 1)
    expect(wrap.state('addWidgetForm')).to.equal(false)
    expect(wrap.state('editMode')).to.equal(true)

  })

  // Method + render: Ensure that method calls cause the appropriate components to be rendered
  it('calls renderList and no other form render functions by default', () => {
    resetSpyHistory()
    mount(<ListWrapper {...dummyProps}/>)

    expect(dummyProps.renderNewWidgetForm.callCount).to.equal(0)
    expect(dummyProps.renderEditWidgetForm.callCount).to.equal(0)
    expect(dummyProps.renderList.callCount).to.equal(1)
  })

  it('addWidget causes just renderNewWidgetForm to be called', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    resetSpyHistory()
    instance.addWidget()

    expect(dummyProps.renderNewWidgetForm.callCount).to.equal(1)
    expect(dummyProps.renderEditWidgetForm.callCount).to.equal(0)
    expect(dummyProps.renderList.callCount).to.equal(1)
  })

  it('editWidget causes just renderEditWidgetForm to be called', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    resetSpyHistory()
    instance.editWidget(dummyId)

    expect(dummyProps.renderNewWidgetForm.callCount).to.equal(0)
    expect(dummyProps.renderEditWidgetForm.withArgs(dummyId).callCount).to.equal(1)
    expect(dummyProps.renderList.callCount).to.equal(1)
  })

  it('toggleEditWidget causes renderAddWidgetButton to be called', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    resetSpyHistory()
    const renderAddWidgetButtonSpy = sinon.spy(instance, 'renderAddWidgetButton')
    instance.toggleEditMode()

    expect(renderAddWidgetButtonSpy.callCount).to.equal(1)
    expect(dummyProps.renderNewWidgetForm.callCount).to.equal(0)
    expect(dummyProps.renderEditWidgetForm.callCount).to.equal(0)
    expect(dummyProps.renderList.callCount).to.equal(1)
  })

  // Click event tests: Test that the various buttons cause the appropriate reactions
  it('edit-widget-list-btn calls toggleEditMode on click', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    const toggleEditModeSpy = sinon.spy(instance, 'toggleEditMode')
    const btn = mount(instance.render())

    btn.find('.edit-widget-list-btn').simulate('click')
    expect(toggleEditModeSpy.callCount).to.equal(1)
  })

  it('add-widget-btn calls addWidget on click', () => {
    const wrap = mount(<ListWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    const addWidgetSpy = sinon.spy(instance, 'addWidget')
    const btn = mount(instance.renderAddWidgetButton())

    expect(btn.exists('.add-widget-btn')).to.equal(true)
    btn.find('.add-widget-btn').simulate('click')
    expect(addWidgetSpy.callCount).to.equal(1)
  })
})

describe('<_defaultLoader />', () => {
  it('renders a default-loader component', () => {
    const wrap = mount(<Loader/>)

    expect(wrap.exists('.default-loader')).to.equal(true)
  })
})

describe('< _defaultRenderer />', () => {
  const dummyTitle = 'dummyTitle'
  const expectedWidgetText = <div className="widget-text card-text text-truncate"><p>dummyHTML</p></div>
  const dummyProps = {
    title: dummyTitle,
    html: '<p>dummyHTML</p>',
  }

  it('sets title and html elements on render', () => {
    const wrap = mount(<Renderer {...dummyProps}/>)
    const htmlWrap = mount(expectedWidgetText)

    expect(wrap.find('.widget-title').text()).to.equal(dummyTitle)
    expect(wrap.find('.widget-text').html()).to.equal(htmlWrap.html())
  })
})

describe('<_defaultWidgetWrapper />', () => {
  const dummyPos = 3
  const dummyId = 12
  const dummyListLength = 9
  const dummyProps = {
    position: dummyPos,
    id: dummyId,
    listLength: dummyListLength,
    editMode: false,
    renderWidget: sinon.spy(),
    moveWidget: sinon.spy(),
    editWidget: sinon.spy(),
    deleteWidget: sinon.spy(),
  }

  const resetSpyHistory = () => {
    dummyProps.renderWidget.resetHistory()
    dummyProps.moveWidget.resetHistory()
    dummyProps.deleteWidget.resetHistory()
    dummyProps.editWidget.resetHistory()
  }

  // Method tests: Ensure that the component methods call the appropriate prop function
  it('calls renderWidget and no other prop functions by default', () => {
    resetSpyHistory()
    mount(<WidgetWrapper {...dummyProps}/>)

    expect(dummyProps.renderWidget.callCount).to.equal(1)
    expect(dummyProps.moveWidget.callCount).to.equal(0)
    expect(dummyProps.deleteWidget.callCount).to.equal(0)
    expect(dummyProps.editWidget.callCount).to.equal(0)
  })

  it('moveWidgetUp calls moveWidget once with pos - 1', () => {
    const wrap = mount(<WidgetWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    resetSpyHistory()
    instance.moveWidgetUp()

    expect(dummyProps.renderWidget.callCount).to.equal(0)
    expect(dummyProps.moveWidget.withArgs(dummyPos - 1).callCount).to.equal(1)
    expect(dummyProps.deleteWidget.callCount).to.equal(0)
    expect(dummyProps.editWidget.callCount).to.equal(0)
  })

  it('moveWidgetDown calls moveWidget once with pos + 1', () => {
    const wrap = mount(<WidgetWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    resetSpyHistory()
    instance.moveWidgetDown()

    expect(dummyProps.renderWidget.callCount).to.equal(0)
    expect(dummyProps.moveWidget.withArgs(dummyPos + 1).callCount).to.equal(1)
    expect(dummyProps.deleteWidget.callCount).to.equal(0)
    expect(dummyProps.editWidget.callCount).to.equal(0)
  })

  it('editWidget calls editWidget with id', () => {
    const wrap = mount(<WidgetWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    resetSpyHistory()
    instance.editWidget(dummyId)

    expect(dummyProps.renderWidget.callCount).to.equal(0)
    expect(dummyProps.moveWidget.callCount).to.equal(0)
    expect(dummyProps.deleteWidget.callCount).to.equal(0)
    expect(dummyProps.editWidget.withArgs(dummyId).callCount).to.equal(1)
  })

  it('deleteWidget calls deleteWidget', () => {
    const wrap = mount(<WidgetWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    resetSpyHistory()
    instance.deleteWidget()

    expect(dummyProps.renderWidget.callCount).to.equal(0)
    expect(dummyProps.moveWidget.callCount).to.equal(0)
    expect(dummyProps.deleteWidget.callCount).to.equal(1)
    expect(dummyProps.editWidget.callCount).to.equal(0)
  })

  it('renderEditBar returns an edit bar with four buttons', () => {
    const wrap = mount(<WidgetWrapper {...dummyProps}/>)
    const instance = wrap.instance()
    const editBar = mount(instance.renderEditBar())

    expect(editBar.find('.edit-widget-bar').children().filter('button')).to.have.length(4)
  })

  // Click event tests: Ensure that all the click events behave appropriately
  it('first edit-widget-bar button calls moveWidgetUp on click', () => {
    const wrap = mount(<WidgetWrapper {...dummyProps} editMode={true}/>)
    resetSpyHistory()

    wrap.find('.edit-widget-bar').childAt(0).simulate('click')
    expect(dummyProps.renderWidget.callCount).to.equal(0)
    expect(dummyProps.moveWidget.withArgs(dummyPos - 1).callCount).to.equal(1)
    expect(dummyProps.deleteWidget.callCount).to.equal(0)
    expect(dummyProps.editWidget.callCount).to.equal(0)
  })

  it('second edit-widget-bar button calls moveWidgetDown on click', () => {
    const wrap = mount(<WidgetWrapper {...dummyProps} editMode={true}/>)
    resetSpyHistory()

    wrap.find('.edit-widget-bar').childAt(1).simulate('click')
    expect(dummyProps.renderWidget.callCount).to.equal(0)
    expect(dummyProps.moveWidget.withArgs(dummyPos + 1).callCount).to.equal(1)
    expect(dummyProps.deleteWidget.callCount).to.equal(0)
    expect(dummyProps.editWidget.callCount).to.equal(0)
  })

  it('third edit-widget-bar button calls editWidget on click', () => {
    const wrap = mount(<WidgetWrapper {...dummyProps} editMode={true}/>)
    resetSpyHistory()

    wrap.find('.edit-widget-bar').childAt(2).simulate('click')
    expect(dummyProps.renderWidget.callCount).to.equal(0)
    expect(dummyProps.moveWidget.callCount).to.equal(0)
    expect(dummyProps.deleteWidget.callCount).to.equal(0)
    expect(dummyProps.editWidget.withArgs(dummyId).callCount).to.equal(1)
  })

  it('fourth edit-widget-bar button calls deleteWidget on click', () => {
    const wrap = mount(<WidgetWrapper {...dummyProps} editMode={true}/>)
    resetSpyHistory()

    wrap.find('.edit-widget-bar').childAt(3).simulate('click')
    expect(dummyProps.renderWidget.callCount).to.equal(0)
    expect(dummyProps.moveWidget.callCount).to.equal(0)
    expect(dummyProps.deleteWidget.callCount).to.equal(1)
    expect(dummyProps.editWidget.callCount).to.equal(0)
  })
})
