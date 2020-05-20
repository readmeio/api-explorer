import React from 'react'
import { shallow } from 'enzyme'
import { mountWithIntl } from 'enzyme-react-intl'
import { omit } from 'ramda'
import { FormattedMessage } from 'react-intl';
import jsf from 'json-schema-faker'

import SchemaTabs from '../src/components/SchemaTabs'
import BlockWithTab from '../src/components/BlockWithTab';
import Oas from '../src/lib/Oas'
import RequestSchema from '../src/RequestSchema'
import ResponseSchema from '../src/ResponseSchema'
import JsonViewer from "../src/components/JsonViewer";

const petstore = require('./fixtures/petstore/oas.json')
const operationWithExample = require('./fixtures/withExample/operation.json')
const oasWithExample = require('./fixtures/withExample/oas.json')

const { Operation } = Oas
const oas = new Oas(petstore);

const operationSchema = {
  responses: {
    '200': {
      content: {
        'application/xml': {
          description: 'successful operation',
          schema: {
            $ref: '#/components/schemas/Pet',
          },
        },
      },
    },
  },
  requestBody: {
    foo: 'bar'
  }
}
const props = {
  operation: new Operation(
    oas,
    '/',
    'get',
    Object.assign({}, oas.operation('/pet/{petId}', 'get'), operationSchema),
  ),
  oas,
};

describe('SchemaTabs', () => {
  let element
  let block

  beforeEach(() => {
    element = shallow(<SchemaTabs{...props} />)
    block = element.find(BlockWithTab)
  })

  test('renders a tab with 3 items', () => {
    expect(block).toHaveLength(1)
    const { items } = block.props()
    const exampleLabel = <FormattedMessage defaultMessage="Example" id="schemaTabs.label.example" />
    const requestLabel = <FormattedMessage defaultMessage="Request" id="schemaTabs.label.request" />
    const responseLabel = <FormattedMessage defaultMessage="Response" id="schemaTabs.label.response" />
    expect(items).toEqual([
      { value: 'example', label: exampleLabel },
      { value: 'request', label: requestLabel },
      { value: 'response', label: responseLabel }
    ])
  })

  test('set correct tab when one is clicked', () => {
    expect(element.find(BlockWithTab).prop('selected')).toEqual('example')
    element.find(BlockWithTab).simulate('click', 'response')
    expect(element.find(BlockWithTab).prop('selected')).toEqual('response')
  })

  describe('if example is selected', () => {
    beforeEach(() => {
      element = shallow(<SchemaTabs {...props} />)
      block = element.find(BlockWithTab)
    })

    test('and render example if requestBody.example is set', () => {
      element = mountWithIntl(
        <SchemaTabs
          oas={oasWithExample}
          operation={operationWithExample}
        />
      )

      const petType = 'Carlino'
      const petChildren = ['john', 'doo']
      expect(element.find(JsonViewer).prop('schema')).toEqual({pet_type: petType, pet_children: petChildren})
    })

    test('render generated example when requestBody.example is not set', () => {
      jest.mock('json-schema-faker')
      const petId = 1234
      // eslint-disable-next-line no-underscore-dangle
      jsf._generateReturnValue({petId})

      element = mountWithIntl(<SchemaTabs {...props} />)
      expect(element.find(JsonViewer).prop('schema')).toEqual({petId})

      jest.unmock('json-schema-faker')
    })

    test('render missing schema message', () => {
      element = shallow(
        <SchemaTabs
          oas={{}}
          operation={{}}
        />
      )
      const formattedMessage = element.find(FormattedMessage)
      expect(formattedMessage).toHaveLength(1)
      expect(formattedMessage.prop('id')).toEqual('schemaTabs.missing.example')
    })
  })

  describe('if request is set as selected', () => {
    beforeEach(() => {
      element = shallow(<SchemaTabs {...props} />)
      block = element.find(BlockWithTab)
      block.prop('onClick')('request')
      element.update()
    })

    test('renders RequestSchema if operation.requestBody is set', () => {
      expect(element.find(RequestSchema)).toHaveLength(1)
    })

    test('render missing schema message if request is not set', () => {
      element = shallow(
        <SchemaTabs
          {...props}
          operation={new Operation(
            oas,
            '/',
            'get',
            {
              ...oas.operation('/pet/{petId}', 'get'),
              ...omit(['requestBody'], operationSchema)
            }
          )}
        />
      )
      element.find(BlockWithTab).prop('onClick')('request')
      element.update()
      const formattedMessage = element.find(FormattedMessage)
      expect(formattedMessage).toHaveLength(1)
      expect(formattedMessage.prop('id')).toEqual('schemaTabs.missing.request')
    })
  })

  describe('if response is set as selected', () => {
    beforeEach(() => {
      element = shallow(<SchemaTabs {...props} />)
      block = element.find(BlockWithTab)
      block.prop('onClick')('response')
      element.update()
    })

    test('renders ResponseSchema if operation.responses is set', () => {
      expect(element.find(ResponseSchema)).toHaveLength(1)
    })

    test('render missing schema message if responses is not set', () => {
      element = shallow(
        <SchemaTabs
          {...props}
          operation={new Operation(
            oas,
            '/',
            'get',
            {
              ...omit(['responses'], oas.operation('/pet/{petId}', 'get'))
            }
          )}
        />
      )
      element.find(BlockWithTab).prop('onClick')('response')
      element.update()
      const formattedMessage = element.find(FormattedMessage)
      expect(formattedMessage).toHaveLength(1)
      expect(formattedMessage.prop('id')).toEqual('schemaTabs.missing.response')
    })
  })
})
