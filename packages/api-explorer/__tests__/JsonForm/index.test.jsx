import React from 'react'
import {mount} from 'enzyme'
import JSONEditor from '@json-editor/json-editor'
import renderer from 'react-test-renderer'

import JsonForm from '../../src/JsonForm'

const extendMock = jest.fn()
extendMock.mockReturnValue({extend: extendMock})

const editorsMock = {
  foo: {extend: extendMock},
  array: {extend: extendMock},
  object: {extend: extendMock}
}

jest.mock('@json-editor/json-editor')

function createNodeMock(element) {
    if (element.type === 'form') {
      return {
        thisIs: 'my-form'
      };
    }
    return null;
}
describe('JSONForm ', () => {
    const props = {
        schema: {
            type: 'object',
            properties: {
                petId: {
                    type: 'integer',
                    description: 'ID of pet to return',
                    format: 'int64'
                }
            },
            required: ['petId']
        },
        onChange: jest.fn(),
        onSubmit: jest.fn()
    }
    beforeEach(() => {
      extendMock.mockClear()
      JSONEditor.defaults.editors = editorsMock
    })
    it('renders json-editor', () => {
        renderer.create(
          <JsonForm {...props} />, {createNodeMock})

        expect(JSONEditor).toHaveBeenCalledWith({
            thisIs: 'my-form'
          }, {
            schema: {
                ...props.schema,
                title: " "
            },
            show_opt_in: true,
            prompt_before_delete: false,
            form_name_root:"",
            theme: "antdTheme"
        })
    })
    it('when form submits, calls onSubmit prop', () => {
        const element = mount(<JsonForm {...props} />)
        const mockEvent = {preventDefault: jest.fn()}
        element.find('form').prop('onSubmit')(mockEvent)
        expect(props.onSubmit).toHaveBeenCalledTimes(1)
        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
    })
    it('extend all json-editor editors', () => {
      mount(<JsonForm {...props} />)
      expect(
        extendMock.mock.calls.map(call => Object.keys(call[0]))
      ).toEqual([
        ['setContainer', 'build'], // foo
        ['setContainer', 'build'], // array - get-custom-editor
        ['addControls', 'refreshValue'], // array-custom-editor  
        ['setContainer', 'build'], // object - get-custom-editor
        ['build'] // object-custom-editor
      ])
    })
})
