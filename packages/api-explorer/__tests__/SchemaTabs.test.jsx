/* eslint-disable no-underscore-dangle */
import React from 'react'
import { shallow } from 'enzyme'
import {mountWithIntl, loadTranslationObject} from 'enzyme-react-intl'
import ReactTestUtils from 'react-dom/test-utils'
import { omit } from 'ramda'
import { FormattedMessage } from 'react-intl';
import jsf from 'json-schema-faker'
import {Button, Alert} from "antd";
import ReactJson from 'react-json-view'

import OAS from './fixtures/basicOas.json'
import OPERATION from './fixtures/basicOperations.json'

import SchemaTabs from '../src/components/SchemaTabs'
import BlockWithTab from '../src/components/BlockWithTab'
import JsonViewer from '../src/components/JsonViewer'
import Select from '../src/components/Select'

import strings from '../i18n/en.json'

const operationWithExample = require('./fixtures/withExample/operation.json')
const oasWithExample = require('./fixtures/withExample/oas.json')
const maxStackOas = require('./fixtures/withExample/maxStackOas.json')
const maxStackOperation = require('./fixtures/withExample/maxStackOperation.json')

jest.mock('json-schema-faker')

describe('SchemaTabs', () => {
  loadTranslationObject(strings)

  const props = {
    oas: OAS,
    operation: OPERATION
  }

  let element
  let block

  beforeEach(() => {
    jest.clearAllMocks()
    element = shallow(<SchemaTabs {...props} />)
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

  test('renders a ReactJson initially collapsed when switch between tabs', (done) => {
    jsf._generateReturnValue(() => ({petId: 3}))
    element = mountWithIntl(<SchemaTabs {...props} />)

    setTimeout(() => {
      element.mount()
      expect(element.find(BlockWithTab).prop('selected')).toEqual('example')

      expect(element.find(ReactJson).prop('collapsed')).toEqual(1)
      clickExpandButton(element)
      expect(element.find(ReactJson).prop('collapsed')).toEqual(10)

      element.find(BlockWithTab).prop('onClick')('request')
      element.mount()
      expect(element.find(BlockWithTab).prop('selected')).toEqual('request')
      expect(element.find(ReactJson).prop('collapsed')).toEqual(1)

      done()
    }, 0)
  })

  describe('with example schema selected', () => {
    test('render jsonEditor with examples', (done) => {
      const mockExample = {pet_type: 'carlino', pet_children: ['scooby', 'doo']}
      jsf._generateReturnValue(() => mockExample)
      element = shallow(<SchemaTabs oas={oasWithExample} operation={operationWithExample} />)
      setTimeout(() => {
        element.update()
        expect(element.find(JsonViewer).prop('schema')).toEqual(mockExample)
        done()
      })
    })

    test('render missing schema message', (done) => {
      const missingSchema = {}
      element = shallow(<SchemaTabs {...props} operation={missingSchema} />)
      assertToHaveFoundMissingSchemaMessage(element, 'example', done)
    })

    test('render errors alert', (done) => {
      // eslint-disable-next-line no-underscore-dangle
      jsf._generateReturnValue(() => {
        throw new Error('Maximum call stack size exceeded')
      })
      element = shallow(<SchemaTabs oas={maxStackOas} operation={maxStackOperation} />)
      setTimeout(() => {
        element.update()
        expect(element.find(Alert).prop('message')).toEqual('Maximum call stack size exceeded')
        done()
      })
    })
  })

  describe('with request schema selected', () => {
    test('render jsonEditor', (done) => {
      selectResponseTab(element, 'request')
      setTimeout(() => {
        element.update()
        const expected = {
          type: 'object',
          properties: {
            lorem: {
              type: 'string'
            }
          }
        }
        expect(element.find(JsonViewer).prop('schema')).toEqual(expected)
        done()
      })
    })

    test('render missing schema message if the request is missing', (done) => {
      element = shallow(<SchemaTabs {...props} operation={omit(['requestBody'], OPERATION)} />)
      assertToHaveFoundMissingSchemaMessage(element, 'request', done)
    })
  })

  describe('with response schema selected', () => {
    test('renders jsonEditor', (done) => {
      selectResponseTab(element, 'response')
      setTimeout(() => {
        element.update()
        expect(element.find(Select).prop('value')).toEqual('200')
        const expectedFor200 = {
          "description": "Default Response",
          "content": {
            "*/*": {
              "schema": {
                "type": "object",
                "properties": {
                  "_id": {
                    "type": "string",
                    "pattern": "^[a-fA-F\\d]{24}$",
                    "description": "Hexadecimal identifier of the document in the collection"
                  }
                }
              }
            }
          }
        }
        expect(element.find(JsonViewer).prop('schema')).toEqual(expectedFor200)

        element.find(Select).simulate('change', '403')
        const expectedFor403 = {
          "description": "Unauthorized",
          "content": {
            "*/*": {
              "schema": {
                "type": "object",
                "properties": {
                  "_id": {
                    "type": "string",
                    "pattern": "^[a-fA-F\\d]{24}$",
                    "description": "Hexadecimal identifier of the document in the collection"
                  }
                }
              }
            }
          }
        }
        expect(element.find(JsonViewer).prop('schema')).toEqual(expectedFor403)
        done()
      })
    })

    test('render correct jsonEditor when change response statusCode', () => {
      selectResponseTab(element, 'response')
      expect(element.find(Select).prop('value')).toEqual('200')
      expect(element.find(BlockWithTab).find(JsonViewer)).toHaveLength(1)
    })

    test('render missing schema message if the responses is missing', (done) => {
      element = shallow(<SchemaTabs {...props} operation={omit(['responses'], OPERATION)} />)
      assertToHaveFoundMissingSchemaMessage(element, 'response', done)
    })
  })
})

function selectResponseTab (element, tabType) {
  return element.find(BlockWithTab).simulate('click', tabType)
}

function assertToHaveFoundMissingSchemaMessage(element, tabType, done) {
  selectResponseTab(element, tabType)
  setTimeout(() => {
    element.update()
    const formattedMessage = element.find(FormattedMessage)
    expect(formattedMessage.prop('id')).toEqual(`schemaTabs.missing.${tabType}`)
    done()
  })
}


function clickExpandButton(element) {
  const formattedMessage = element
    .findWhere(node => node.type() === FormattedMessage &&
      (node.prop('id') === 'schemas.collapse' || node.prop('id') === 'schemas.expand'))
  const button = formattedMessage.closest(Button)

  ReactTestUtils.act(() => {
    button.prop('onClick')()
  })
  element.mount()
}
