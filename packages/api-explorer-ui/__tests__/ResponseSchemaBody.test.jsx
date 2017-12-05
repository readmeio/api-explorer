const React = require('react');
const fs = require('fs');
const path = require('path');
const CircularJSON = require('circular-json');
const { mount } = require('enzyme');

const ResponseSchemaBody = require('../src/ResponseSchemaBody');
const { flattenResponseSchema } = require('../src/ResponseSchemaBody');
const Oas = require('../src/lib/Oas');

const petstore = CircularJSON.parse(
  fs.readFileSync(path.join(__dirname, '/fixtures/petstore/circular-oas.json'), 'utf8'),
);

const oas = new Oas(petstore);

const props = {
  operation: oas.operation('/pet/{petId}', 'get'),
};

const operation = { ...props };

const schema = operation.operation.responses['200'].content['application/json'].schema;

test('should display response schema description', () => {
  const responseSchemaBody = mount(<ResponseSchemaBody schema={schema} />);
  const description = responseSchemaBody.find('span').last();

  expect(responseSchemaBody.contains([<th>PhotoUrls.items</th>])).toBe(false);
  expect(responseSchemaBody.contains([<th>tags.name</th>])).toBe(true);
  expect(description.text()).toBe('pet status in the store');
});

test('should flatten object', () => {
  const responseSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
    },
  };

  expect(flattenResponseSchema(responseSchema)).toEqual([
    {
      name: 'name',
      type: 'string',
      description: undefined,
    },
  ]);
});

test('should flatten nested object', () => {
  const responseSchema = {
    type: 'object',
    properties: {
      category: {
        type: 'object',
        properties: {
          tag: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    },
  };
  expect(flattenResponseSchema(responseSchema)).toEqual([
    {
      name: 'tag.name',
      type: 'string',
      description: undefined,
    },
  ]);
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
      type: 'array',
      description: undefined,
    },
  ]);
});

test('should flatten array of objects ', () => {
  const responseSchema = {
    type: 'object',
    properties: {
      category: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      },
    },
  };
  expect(flattenResponseSchema(responseSchema)).toEqual([
    {
      name: 'category.name',
      type: 'string',
      description: undefined,
    },
  ]);
});
