import React from 'react'
import { expect } from 'chai'
import sinon from 'sinon'
import { mount } from 'enzyme'
import Select from 'react-select'

import { apiPath } from '../src/utils'
import { EditWidgetForm, NewWidgetForm, WidgetForm } from '../src/widget_form'
import { _defaultLoader as Loader } from '../src/defaults'
import { makeOptionsFromList } from '../src/utils'

const dummyWidgetListId = 2
const dummyWidgetId = 3
const dummyListLength = 4
const dummyWidgetClass = 'Text'
const dummyWidgetClasses = ['Text', 'Url']
const dummyWidgetClassConfiguration = {
  Text: [{
    key: 'title',
    label: 'Title',
    inputType: 'text',
    props: {
      placeholder: 'Enter widget title',
      autoFocus: true
    }
  },
  {
    key: 'body',
    label: 'Body',
    inputType: 'textarea',
    props: {
      placeholder: 'Enter widget text',
      maxLength: '',
      minLength: ''
    }
  }]
}
const dummyWidgetClassConfigurations = {
  ...dummyWidgetClassConfiguration,
  Url: [{
    key: 'title',
    label: 'Title',
    inputType: 'text',
    props: {
      placeholder: 'Enter widget title',
      autoFocus: true
    }
  },
  {
    key: 'url',
    label: 'URL',
    inputType: 'text',
    props: {
      placeholder: 'Enter url',
      maxLength: '',
      minLength: ''
    }
  }]
}
const dummyFormData = {
  title: 'dummyTitle',
  body: 'dummyBody'
}

const dummyFetch = () => Promise.resolve(null)

// General props for both types of widgetForms, edit and new
const dummyGeneralFormProps = {
  widgetListId: dummyWidgetListId,
  fetchData: dummyFetch,
  errorHandler: sinon.spy(),
  onSubmit: sinon.spy(),
  Loader: Loader,
}

const fetchSpy = sinon.spy(dummyGeneralFormProps, 'fetchData')
const resetSpyHistory = () => {
  fetchSpy.resetHistory()
  dummyGeneralFormProps.errorHandler.resetHistory()
  dummyGeneralFormProps.onSubmit.resetHistory()
}

// props for an EditWidgetForm
const dummyEditWidgetFormProps = {
  widgetId: dummyWidgetId,
  ...dummyGeneralFormProps
}

// state for an EditWidgetForm
const dummyEditWidgetFormState = {
  currentWidgetData: dummyFormData,
  widgetClassConfiguration: dummyWidgetClassConfiguration,
  widgetClass: dummyWidgetClass
}

// props for a NewWidgetForm
const dummyNewWidgetFormProps = {
  listLength: dummyListLength,
  ...dummyGeneralFormProps
}

const dummyNewWidgetFormState = {
  widgetClassConfigurations: dummyWidgetClassConfigurations,
  widgetClasses: dummyWidgetClasses,
}


// props for a WidgetForm called by an EditWidgetForm
const dummyEditFormProps = {
  formData: dummyFormData,
  onSubmit: sinon.spy(),
  widgetClasses: [dummyWidgetClass],
  widgetClassConfigurations: dummyWidgetClassConfiguration,
  widgetClass: dummyWidgetClass,
}

// props for a WidgetForm passed from a NewWidgetForm
const dummyNewFormProps = {
  formData: null,
  onSubmit: sinon.spy(),
  widgetClasses: dummyWidgetClasses,
  widgetClassConfigurations: dummyWidgetClassConfigurations,
}


describe('<EditWidgetForm />', () => {
  // Test default behavior
  it('returns loader if no data is loaded', () => {
    const wrap = mount(<EditWidgetForm {...dummyEditWidgetFormProps}/>)

    expect(wrap.exists('.default-loader')).to.equal(true)
  })

  it('renders a WidgetForm if data is loaded and that form submits properly', () => {
    const wrap = mount(<EditWidgetForm {...dummyEditWidgetFormProps}/>)
    wrap.setState(dummyEditWidgetFormState)
    wrap.update()

    expect(wrap.exists('WidgetForm')).to.equal(true)
    expect(wrap.find(WidgetForm).prop('formData')).to.deep.equal(dummyFormData)
    expect(wrap.find(WidgetForm).prop('widgetClass')).to.equal(dummyWidgetClass)
    expect(wrap.find(WidgetForm).prop('widgetClassConfigurations')).to.deep.equal(dummyWidgetClassConfiguration)
    expect(wrap.find(WidgetForm).prop('widgetClasses')).to.have.length(1)
    expect(wrap.find(WidgetForm).prop('widgetClasses')[0]).to.equal(dummyWidgetClass)

    wrap.simulate('submit')
    const { title, ...configuration } = dummyEditWidgetFormState.currentWidgetData
    expect(fetchSpy.withArgs(apiPath('widget', dummyWidgetId), {
      body: JSON.stringify({
        configuration: configuration,
        title: title,
        widget_class: dummyWidgetClass,
      }),
      method: 'PATCH',
    }).callCount).to.equal(1)
    resetSpyHistory()
  })
})

describe('<NewWidgetForm />', () => {
  // Test default behavior
  it('returns loader if no data is loaded', () => {
    const wrap = mount(<NewWidgetForm {...dummyNewWidgetFormProps}/>)

    expect(wrap.exists('.default-loader')).to.equal(true)
  })

  it('renders a blank WidgetForm if data is loaded and that form submits properly', () => {
    const wrap = mount(<NewWidgetForm {...dummyNewWidgetFormProps}/>)
    wrap.setState(dummyNewWidgetFormState)
    wrap.update()

    expect(wrap.exists('WidgetForm')).to.equal(true)
    expect(wrap.find(WidgetForm).prop('formData')).to.equal(null)
    expect(wrap.find(WidgetForm).prop('widgetClass')).to.equal('')
    expect(wrap.find(WidgetForm).prop('widgetClassConfigurations')).to.deep.equal(dummyWidgetClassConfigurations)
    expect(wrap.find(WidgetForm).prop('widgetClasses')).to.equal(dummyWidgetClasses)

    wrap.find(WidgetForm).setState({formData: dummyFormData})
    wrap.simulate('submit')
    const { title, ...configuration } = dummyFormData
    expect(fetchSpy.withArgs(apiPath('widget'), {
      body: JSON.stringify({
        configuration: configuration,
        title: title,
        position: dummyListLength,
        widget_list: dummyWidgetListId,
        widget_class: '',
      }),
      method: 'POST',
    }).callCount).to.equal(1)
    resetSpyHistory()
  })
})

describe('<WidgetForm />', () => {
  const selectModel = {
      key: 'dummySelectKey',
      label: 'dummySelectLabel',
      inputType: 'select',
      props: {
        isMulti: false,
        placeholder: 'dummySelectPlaceholder'
      },
      choices: {
        1: 'some',
        2: 'good',
        3: 'choices',
      }
    }
    const textareaModel= {
      key: 'dummyTextareaKey',
      label: 'dummyTextareaLabel',
      inputType: 'textarea',
      props: {
        placeholder: 'dummyTextareaPlaceholder',
      }
    }
    const textModel= {
      key: 'dummyTextKey',
      label: 'dummyTextLabel',
      inputType: 'text',
      props: {
        placeholder: 'dummyTextPlaceholder',
        autoFocus: true
      }
    }
    const dummyModel = [textModel, textareaModel, selectModel]

  // Test default behavior
  it('renders a widget class select by default if there is more than one widget class', () => {
    const wrap = mount(<WidgetForm {...dummyNewFormProps}/>)

    expect(wrap.find(Select)).to.have.length(1)
    expect(wrap.find('.widget-form-input-group')).to.have.length(1)
  })

  it('renders no widget class select and an appropriate input group if there is only one widget class option', () => {
    const wrap = mount(<WidgetForm {...dummyEditFormProps}/>)

    expect(wrap.find(Select)).to.have.length(0)
    for (let input of dummyWidgetClassConfiguration[dummyWidgetClass]) {
      expect(wrap.exists(`#widget-form-input-${input.key}`)).to.equal(true)
    }
    expect(wrap.state('formData')).to.deep.equal(dummyFormData)
  })

  // method tests
  it('onChange sets the state appropriately', () => {
    const wrap = mount(<WidgetForm {...dummyNewFormProps}/>)
    const instance = wrap.instance()

    instance.onChange('title', dummyFormData.title)
    expect(wrap.state('formData').title).to.equal(dummyFormData.title)

    instance.onChange('body', dummyFormData.body)
    expect(wrap.state('formData')).to.deep.equal(dummyFormData)
  })

  it('onSubmit calls the prop onSubmit with widgetClass and formData', () => {
    const wrap = mount(<WidgetForm {...dummyEditFormProps}/>)
    wrap.setState({
      widgetClass: dummyWidgetClass,
      formData: dummyFormData,
    })

    const instance = wrap.instance()
    instance.onSubmit(document.createEvent('Event'))
    expect(wrap.prop('onSubmit').withArgs(dummyWidgetClass, dummyFormData).callCount).to.equal(1)
    resetSpyHistory()
  })

  it('makeWidgetClassSelect creates a select with options that match the widgetClasses given', () => {
    const wrap = mount(<WidgetForm {...dummyNewFormProps}/>)
    const instance = wrap.instance()
    const widgetClassSelect = mount(instance.makeWidgetClassSelect())

    expect(widgetClassSelect.exists('#widget-class-input-select')).to.equal(true)
    expect(widgetClassSelect.prop('options')).to.deep.equal(makeOptionsFromList(dummyWidgetClasses))
  })

  it('renderInputs creates an appropriate set of inputs for a select configuration', () => {
    let defaultValues = {}
    const dummyDefaultValue = Object.keys(selectModel.choices)[1]
    defaultValues[selectModel.key] = [dummyDefaultValue]
    const wrap = mount(<WidgetForm {...dummyNewFormProps} formData={defaultValues}/>)
    const instance = wrap.instance()

    const inputForm = mount(instance.renderInputs(dummyModel))

    expect(inputForm.find(Select)).to.have.length(1)
    const select = inputForm.find(Select)
    expect(select.is(`#widget-form-input-${selectModel.key}`)).to.equal(true)
    expect(select.hasClass('widget-form-input-select')).to.equal(true)
    expect(select.prop('defaultValue')[0].value).to.equal(dummyDefaultValue)
    expect(select.props()).to.include(selectModel.props)
  })

  it('renderInputs creates an appropriate set of inputs for a textarea configuration', () => {
    let defaultValues = {}
    const dummyDefaultValue = 'some text for your text area'
    defaultValues[textareaModel.key] = dummyDefaultValue
    const wrap = mount(<WidgetForm {...dummyNewFormProps} formData={defaultValues}/>)
    console.log(wrap.props())
    const instance = wrap.instance()

    const inputForm = mount(instance.renderInputs(dummyModel))
    expect(inputForm.find(`#widget-form-input-${textareaModel.key}`)).to.have.length(1)

    const textarea = inputForm.find(`#widget-form-input-${textareaModel.key}`)
    expect(textarea.hasClass('widget-form-input-textarea')).to.equal(true)
    expect(textarea.prop('defaultValue')).to.equal(dummyDefaultValue)
    expect(textarea.props()).to.include(textareaModel.props)

    const changeValue = 'some new text for your textarea'
    textarea.simulate('change', {target: {value: changeValue}})
    expect(wrap.state('formData')[textareaModel.key]).to.equal(changeValue)
  })

  it('renderInputs creates an appropriate set of inputs for a text configuration', () => {
    let defaultValues = {}
    const dummyDefaultValue = 'some text'
    defaultValues[textModel.key] = dummyDefaultValue
    const wrap = mount(<WidgetForm {...dummyNewFormProps} formData={defaultValues}/>)
    const instance = wrap.instance()

    const inputForm = mount(instance.renderInputs(dummyModel))
    expect(inputForm.find(`#widget-form-input-${textModel.key}`)).to.have.length(1)

    const text = inputForm.find(`#widget-form-input-${textModel.key}`)
    expect(text.hasClass('widget-form-input-text')).to.equal(true)
    expect(text.prop('defaultValue')).to.equal(dummyDefaultValue)
    expect(text.props()).to.include(textModel.props)

    const changeValue = 'some new text'
    text.simulate('change', {target: {value: changeValue}})
    expect(wrap.state('formData')[textModel.key]).to.equal(changeValue)
  })
})
