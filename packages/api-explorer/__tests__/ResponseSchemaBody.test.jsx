const React = require('react');
const { shallow, mount } = require('enzyme');
const Oas = require('@readme/oas-tooling');

const ResponseSchemaBody = require('../src/ResponseSchemaBody');
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
  expect(responseSchemaBody.find('td').text()).toBe('a');
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
      .filter(a => a === 'category.name')
  ).toHaveLength(1);
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
      .filter(a => a === 'a.a')
  ).toHaveLength(1);
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
      .filter(a => a === '[Object]')
  ).toHaveLength(1);
  expect(
    responseSchemaBody
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'a.pets[].index')
  ).toHaveLength(1);
});

test('not fail when object property missing', () => {
  const schema = {
    type: 'object',
  };

  expect(shallow(<ResponseSchemaBody oas={oas} schema={schema} />).find('th')).toHaveLength(0);
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
      .filter(a => a === 'name')
  ).toHaveLength(1);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'String')
  ).toHaveLength(1);
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
      .filter(a => a === 'a.a.a')
  ).toHaveLength(1);
  expect(
    responseSchemaBody
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'a.a.a.a')
  ).toHaveLength(0);
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
      .filter(a => a === 'name')
  ).toHaveLength(1);
  expect(
    responseSchemaBody
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'String')
  ).toHaveLength(1);
});

test.each([
  [true, '<a href="https://example.com" target="_self" title="">Description</a>'],
  [false, '<a href="https://example.com" target="_self">Description</a>'],
])('should render markdown in the description [new markdown engine=%s]', (useNewMarkdownEngine, expected) => {
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
    mount(<ResponseSchemaBody oas={oas} schema={schema} useNewMarkdownEngine={useNewMarkdownEngine} />)
      .find('a')
      .html()
  ).toBe(expected);
});

test('should show "string" response type for a simple `string` schema', () => {
  const schema = {
    type: 'string',
  };

  expect(shallow(<ResponseSchemaBody oas={oas} schema={schema} />).text()).toBe('Response schema type: string');
});

test('should show "string" response type for an `object` schema that contains a string', () => {
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
      .text()
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
      .text()
  ).toBe('Response schema type: array of objects');
});
