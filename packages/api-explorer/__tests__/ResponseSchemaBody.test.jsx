const React = require('react');
const { shallow, mount } = require('enzyme');

const ResponseSchemaBody = require('../src/ResponseSchemaBody');
const flattenResponseSchema = require('../src/ResponseSchemaBody').flattenResponseSchema;
const flatten = require('../src/ResponseSchemaBody').flatten;
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

  expect(responseSchemaBody.find('th').text()).toContain('String');
  expect(responseSchemaBody.find('td').text()).toEqual('a');
});

test('display properties if object contains $ref type', () => {
  const schema = {
    type: 'object',
    properties: {
      category: {
        $ref: '#/components/schemas/Category',
      },
    },
  };

  expect(
    shallow(<ResponseSchemaBody oas={oas} schema={schema} />)
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'category.name').length,
  ).toBe(1);
});

test('should flatten schema to an array', () => {
  const responseSchema = {
    type: 'object',
    properties: {
      category: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  };
  expect(flattenResponseSchema(responseSchema)).toEqual([
    {
      name: 'category',
      type: '[String]',
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
  expect(
    shallow(<ResponseSchemaBody oas={oas} schema={schema} />)
      .find('td')
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
      .find('th')
      .map(a => a.text())
      .filter(a => a === '[Object]').length,
  ).toBe(1);
  expect(
    responseSchemaBody
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'a.pets[].index').length,
  ).toBe(1);
});

test('not fail when object property missing', () => {
  const schema = {
    type: 'object',
  };

  expect(shallow(<ResponseSchemaBody oas={oas} schema={schema} />).find('th').length).toBe(0);
});

test('render top level array of $ref', () => {
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
      .filter(a => a === 'name').length,
  ).toBe(1);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'String').length,
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
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'a.a.a').length,
  ).toBe(1);
  expect(
    responseSchemaBody
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'a.a.a.a').length,
  ).toBe(0);
});

test('render top level array of objects', () => {
  const schema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
    },
  };

  const responseSchemaBody = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);
  expect(
    responseSchemaBody
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'name').length,
  ).toBe(1);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'String').length,
  ).toBe(1);
});

test('should render markdown in the description', () => {
  const schema = {
    type: 'object',
    properties: {
      a: {
        type: 'string',
        description: '[Description](https://example.com)',
      },
    },
  };

  expect(
    mount(<ResponseSchemaBody oas={oas} schema={schema} />)
      .find('a')
      .html(),
  ).toEqual('<a href="https://example.com" target="_self">Description</a>');
});

test('should show "string" response type', () => {
  const schema = {
    type: 'string',
  };

  expect(shallow(<ResponseSchemaBody oas={oas} schema={schema} />).text()).toBe(
    'Response schema type: string',
  );
});

test('should show "string" response type', () => {
  const schema = {
    type: 'object',
    properties: {
      items: {
        type: 'string',
      },
    },
  };

  expect(
    shallow(<ResponseSchemaBody oas={oas} schema={schema} />)
      .find('p')
      .text(),
  ).toBe('Response schema type: object');
});

test('should show "array" response schema type', () => {
  const schema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
    },
  };

  expect(
    shallow(<ResponseSchemaBody oas={oas} schema={schema} />)
      .find('p')
      .text(),
  ).toBe('Response schema type: array of objects');
});

test('should flatten array ', () => {
  const array = [[1], [2, 3], [[4, 5]]];
  expect(flatten(array)).toEqual([1, 2, 3, 4, 5]);
});
