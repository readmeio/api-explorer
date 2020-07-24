import React from 'react'
import { mountWithIntl } from 'enzyme-react-intl'

import JsonForm from '../../src/JsonForm'
import SCHEMA_WITH_REF_ROOT_AND_NESTED from '../testdata/config-root-ref-and-nested.json'
import EXPECTED_WITH_REF_ROOT_AND_NESTED from '../testdata/config-root-ref-and-nested.expected.json'
import JSON_EDITOR_MAX_STACK_SCHEME_BUG from '../testdata/json-editor-bug-max-stack.json'

describe('JSONForm ', () => {
  const props = {
    schema: {
      type: 'object',
      properties: {
        petId: {
          type: 'integer',
          description: 'ID of pet to return',
          format: 'int64'
        },
        petPedigree: {
          type: 'object',
          properties: {
            petName: {
              type: 'string',
              description: 'Name of pet to return'
            }
          }
        }
      },
      required: ['petId', 'petPedigree']
    },
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    setFormSubmissionListener: jest.fn(),
    title: 'The Title'
  }

  it('snapshot', async () => {
    /**
    * mock because of random id on input/label
    * https://github.com/mia-platform/json-editor/blob/master/src/themes/bootstrap4.js#L129
    */
   
    const originalDateNow = Date.now
    const originalRandom = Math.random
    const originalRequestAnimationFrame = window.requestAnimationFrame

    Date.now = jest.fn().mockReturnValue(1589886640576)
    Math.random = jest.fn().mockReturnValue(0.5)

    /**
    * window.requestAnimationFrame has been mocked to avoid a non-deterministic behaviour of the test.
    * Removing the line below could make the test produce a different snapshot from the expected one.
    */
    window.requestAnimationFrame = jest.fn()

    const element = await mountJsonForm(props)
    expect(element.getDOMNode()).toMatchSnapshot()

    Date.now = originalDateNow
    Math.random = originalRandom
    window.requestAnimationFrame = originalRequestAnimationFrame
  })

  it('when form submits, calls onSubmit prop', async () => {
    const element = await mountJsonForm(props)
    const mockEvent = { preventDefault: jest.fn() }
    element.find('form').prop('onSubmit')(mockEvent)
    expect(props.onSubmit).toHaveBeenCalledTimes(1)
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
  })

  it('on parsing error, shows error', async () => {
    const element = await mountJsonForm({
      ...props,
      schema: {'$ref': '#/foo'}
    })
    expect(element.getDOMNode()).toMatchSnapshot()
  })

  it('converts schema correctly', async () => {
    const schemaWithRef =  {
      components: {
        address: {
          type: "object",
          properties: {
            street_address: { type: "string" },
            city: { type: "string" },
            state: { type: "string" }
          },
          required: ["street_address", "city", "state"]
        }
      },
      $ref: "#/components/address"
    };
    const element = await mountJsonForm({...props, schema: schemaWithRef})
    expect(element.find('JsonForm').instance().jsonSchema).toEqual({
      definitions: {
        components: {
          definitions: {
            address: {
              type: "object",
              properties: {
                street_address: { type: "string" },
                city: { type: "string" },
                state: { type: "string" }
              },
              required: ["street_address", "city", "state"]
            }
          }
        }
      },
      type: "object",
      properties: {
        street_address: { type: "string" },
        city: { type: "string" },
        state: { type: "string" }
      },
      required: ["street_address", "city", "state"]
    })
  })

  it('converts schema correctly with nested ref', async () => {
    const element = await mountJsonForm({...props, schema: SCHEMA_WITH_REF_ROOT_AND_NESTED})
    expect(element.find('JsonForm').instance().jsonSchema).toEqual(EXPECTED_WITH_REF_ROOT_AND_NESTED)
  })

  it('scheme with recursion in object properties (json-editor bug)', async () => {
    const element = await mountJsonForm({...props, schema: JSON_EDITOR_MAX_STACK_SCHEME_BUG})
    expect(element.find('form')).toHaveLength(1)
  })
})

function mountJsonForm (props) {
  return new Promise((resolve) => {
    const element = mountWithIntl(<JsonForm {...props} />)
    setTimeout(() => {
      element.update()
      resolve(element)
    }, 0)
  })
}
