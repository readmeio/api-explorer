import React from 'react'
import JsonViewer from '../src/components/JsonViewer'

const { shallow } = require('enzyme');

const ResponseSchemaBody = require('../src/ResponseSchemaBody');

test('passes schema and missingMessage to JsonViewer', () => {
  const schema = {
    type: 'object',
    properties: {
      category: {
        $ref: '#/definitions/components/schemas/Category',
      },
    },
    definitions: {
      components: {
        schemas: {
          'Category': {
            type: 'string'
          }
        }
      }
    }
  };
  const element =  shallow(<ResponseSchemaBody schema={schema} />)
  const jsonViewer = element.find(JsonViewer)
  expect(jsonViewer.prop('schema')).toEqual(schema)
  expect(jsonViewer.prop('missingMessage')).toEqual('schemaTabs.missing.response')
})
