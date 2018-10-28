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

test('display object properties inside another object in the table', () => {
  const schema = {
    type: 'object',
    properties: {
      a: {
        type: 'object',
        properties: {
          a: {
            type: 'string',
          },
        },
      },
    },
  };
  const responseSchemaBody = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'a.a').length,
  ).toBe(1);
});

test('display $ref items inside object', () => {
  const schema = {
    type: 'object',
    properties: {
      a: {
        type: 'object',
        properties: {
          pets: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Pet',
            },
          },
        },
      },
    },
  };
  const testOas = {
    components: {
      schemas: {
        Pet: {
          type: 'object',
          properties: {
            index: {
              type: 'integer',
            },
          },
        },
      },
    },
  };
  const responseSchemaBody = shallow(<ResponseSchemaBody oas={testOas} schema={schema} />);
  expect(
    responseSchemaBody
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'array of objects').length,
  ).toBe(1);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === '| | index').length,
  ).toBe(1);
});

test('not fail when object property missing', () => {
  const schema = {
    type: 'object',
    additionalProperties: {
      type: 'integer',
      format: 'int32',
    },
  };

  const responseSchemaBody = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);
  expect(responseSchemaBody.find('th').length).toBe(0);
});

test('render top level array of object', () => {
  const schema = {
    type: 'array',
    items: {
      $ref: '#/components/schemas/Pet',
    },
  };

  const testOas = {
    components: {
      schemas: {
        Pet: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'doggie',
            },
          },
        },
      },
    },
  };
  const responseSchemaBody = shallow(<ResponseSchemaBody oas={testOas} schema={schema} />);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'name').length,
  ).toBe(1);
  expect(
    responseSchemaBody
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'string').length,
  ).toBe(1);
});

test('not render more than 3 level deep object', () => {
  const schema = {
    type: 'object',
    properties: {
      a: {
        type: 'object',
        properties: {
          a: {
            type: 'object',
            properties: {
              a: {
                type: 'object',
                properties: {
                  a: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const responseSchemaBody = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'a.a.a').length,
  ).toBe(1);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'a.a.a.a').length,
  ).toBe(0);
});
