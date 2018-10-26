const React = require('react');
const { shallow } = require('enzyme');

const ResponseSchemaBody = require('../src/ResponseSchemaBody');
const flattenResponseSchema = require('../src/ResponseSchemaBody').flattenResponseSchema;
const Oas = require('../src/lib/Oas');
const petstore = require('./fixtures/petstore/oas.json');

const oas = new Oas(petstore);

test('display object properties in the table', () => {
  const schema = {
    type: 'object',
    properties: {
      a: {
        type: 'string',
      },
    },
  };
  const responseSchemaBody = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);

  expect(responseSchemaBody.find('th').text()).toContain('a');
  expect(responseSchemaBody.find('td').text()).toEqual('string');
});

test('display properties if object contains $ref type', () => {
  const schema = {
    type: 'object',
    required: ['name', 'photoUrls'],
    properties: {
      id: {
        type: 'integer',
        format: 'int64',
        readOnly: true,
      },
      category: {
        $ref: '#/components/schemas/Category',
      },
    },
  };
  const responseSchemaBody = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'category.name').length,
  ).toBe(1);
});

test('should flatten array ', () => {
  const responseSchema = {
    type: 'object',
    properties: {
      category: {
        type: 'array',
        items: {
          type: 'string',
          properties: null,
        },
      },
    },
  };
  expect(flattenResponseSchema(responseSchema)).toEqual([
    {
      name: 'category',
      type: 'array of string',
      description: undefined,
    },
  ]);
});
