import React from 'react'
import {mountWithIntl as mount} from 'enzyme-react-intl'

import JsonForm from '../src/JsonForm'
import Params from '../src/Params'

const Oas = require('../src/lib/Oas');
const petstore = require('./fixtures/petstore/oas.json');

const oas = new Oas(petstore);
const operation = oas.operation('/pet/{petId}', 'get');

describe('Params', () => {
  const props = {
    oas,
    operation,
    formData: {},
    onChange:jest.fn(),
    onSubmit: jest.fn(),
    setFormSubmissionListener: jest.fn()
  };

  const expectedSchema = {
    type: 'object',
    properties: {
      petId: {
        type: 'integer',
        description: 'ID of pet to return',
        format: 'int64'
      }
    },
    required: ['petId']
  }
  beforeEach(() => {
    props.onChange.mockClear()
    props.onSubmit.mockClear()
  })
  test('renders a JsonForm with correct schema', () => {
    const params = mount(<Params {...props} />)
    const jsonForm = params.find(JsonForm)
    expect(jsonForm).toHaveLength(1)
    expect(jsonForm.prop('schema')).toEqual(expectedSchema)
  });
  
  test('calls onSubmit when JSONForm calls onSubmit', () => {
    const params = mount(<Params {...props} />)
    const jsonForm = params.find(JsonForm)
    jsonForm.prop('onSubmit')()
    expect(props.onSubmit).toHaveBeenCalledTimes(1)
  });

  test('calls onChange when JSONForm fires onChange', () => {
    const params = mount(<Params {...props} />)
    const jsonForm = params.find(JsonForm)
    jsonForm.prop('onChange')({foo: 'bar'})
    expect(props.onChange).toHaveBeenCalledTimes(1)
    expect(props.onChange).toHaveBeenCalledWith({
      schema: {
        type: 'path',
        schema: expectedSchema,
        label: 'Path Params'
      },
      formData: {
        path: {foo: 'bar'}
      }
    })
  });

  test('renders with correct title', () => {
    const params = mount(<Params {...props} />)
    const jsonForm = params.find(JsonForm)
    const title = jsonForm.prop('title')
    const expectedTitle = {
      id: 'doc.params.pathparams',
      defaultMessage: 'Path Params'
    }
    expect(title).toEqual(expectedTitle.defaultMessage)
  });

})
