import React from 'react'
import { shallow } from 'enzyme'
import { omit } from 'ramda'
import { FormattedMessage } from 'react-intl';

import SchemaTabs from '../src/components/SchemaTabs'
import BlockWithTab from '../src/components/BlockWithTab';
import Oas from '../src/lib/Oas'
import RequestSchema from '../src/RequestSchema'
import ResponseSchema from '../src/ResponseSchema'

const { Operation } = Oas
const petstore = require('./fixtures/petstore/oas.json');

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
    element = shallow(
      <SchemaTabs
        {...props}
      />
    )
    block = element.find(BlockWithTab)
  })

  test('renders a tab with 2 items', () => {
    expect(block).toHaveLength(1)
    const { items } = block.props()
    const requestLabel = <FormattedMessage defaultMessage="Request" id="schemaTabs.label.request" />
    const responseLabel = <FormattedMessage defaultMessage="Response" id="schemaTabs.label.response" />
    expect(items).toEqual([{ value: 'request', label: requestLabel }, { value: 'response', label: responseLabel }])
  })

  test('set correct tab when one is clicked', () => {
    block.prop('onClick')('request')
    element.update()
    expect(block.prop('selected')).toEqual('request')
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
