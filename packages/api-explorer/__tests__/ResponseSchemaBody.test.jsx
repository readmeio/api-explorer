const React = require('react');
const { shallow, mount } = require('enzyme');
const Oas = require('oas/tooling');

const ResponseSchemaBody = require('../src/ResponseSchemaBody');
const petstore = require('./__fixtures__/petstore/oas.json');

const oas = new Oas(petstore);

beforeAll(async () => {
  await oas.dereference();
});

test('display object properties in the table', () => {
  const schema = {
    type: 'object',
    properties: {
      a: {
        type: 'string',
      },
    },
  };

  const comp = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);

  expect(comp.find('th').text()).toContain('String');
  expect(comp.find('td').text()).toBe('a');
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

  const comp = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);

  expect(
    comp
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'a.a')
  ).toHaveLength(1);
});

test('not fail when object property missing', () => {
  const schema = {
    type: 'object',
  };

  const comp = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);
  expect(comp.find('th')).toHaveLength(0);
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

  const comp = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);

  expect(
    comp
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'a.a.a')
  ).toHaveLength(1);
  expect(
    comp
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

  const comp = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);

  expect(
    comp
      .find('td')
      .map(a => a.text())
      .filter(a => a === 'name')
  ).toHaveLength(1);
  expect(
    comp
      .find('th')
      .map(a => a.text())
      .filter(a => a === 'String')
  ).toHaveLength(1);
});

test.each([
  [true, '<a href="https://example.com" target="" title="">Description</a>'],
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

  const comp = mount(<ResponseSchemaBody oas={oas} schema={schema} useNewMarkdownEngine={useNewMarkdownEngine} />);

  expect(comp.find('a').html()).toBe(expected);
});

test('should show "string" response type for a simple `string` schema', () => {
  const schema = {
    type: 'string',
  };

  const comp = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);

  expect(comp.text()).toBe('Response schema type: string');
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

  const comp = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);

  expect(comp.find('p').text()).toBe('Response schema type: object');
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

  const comp = shallow(<ResponseSchemaBody oas={oas} schema={schema} />);

  expect(comp.find('p').text()).toBe('Response schema type: array of objects');
});

describe('$ref handling', () => {
  it('display properties if object contains $ref type', async () => {
    const schema = new Oas({
      components: {
        schemas: {
          Category: { ...petstore.components.schemas.Category },
          test: {
            type: 'object',
            properties: {
              category: {
                $ref: '#/components/schemas/Category',
              },
            },
          },
        },
      },
    });

    await schema.dereference();

    const comp = shallow(<ResponseSchemaBody oas={schema} schema={schema.components.schemas.test} />);

    expect(
      comp
        .find('td')
        .map(a => a.text())
        .filter(a => a === 'category.name')
    ).toHaveLength(1);
  });

  it('display $ref items inside object', async () => {
    const schema = new Oas({
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
          test: {
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
          },
        },
      },
    });

    await schema.dereference();

    const comp = shallow(<ResponseSchemaBody oas={schema} schema={schema.components.schemas.test} />);

    expect(
      comp
        .find('th')
        .map(a => a.text())
        .filter(a => a === '[Object]')
    ).toHaveLength(1);
    expect(
      comp
        .find('td')
        .map(a => a.text())
        .filter(a => a === 'a.pets[].index')
    ).toHaveLength(1);
  });

  it('render top level array of $ref', async () => {
    const schema = new Oas({
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
          test: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Pet',
            },
          },
        },
      },
    });

    await schema.dereference();

    const comp = shallow(<ResponseSchemaBody oas={schema} schema={schema.components.schemas.test} />);

    expect(
      comp
        .find('td')
        .map(a => a.text())
        .filter(a => a === 'name')
    ).toHaveLength(1);
    expect(
      comp
        .find('th')
        .map(a => a.text())
        .filter(a => a === 'String')
    ).toHaveLength(1);
  });

  describe('circular refs', () => {
    let circularOas;

    beforeEach(() => {
      circularOas = {
        components: {
          schemas: {
            Customfields: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Customfields',
              },
            },
          },
        },
      };
    });

    it('should not fail on a fully circular ref', async () => {
      circularOas.components.schemas.test = {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Customfields',
        },
      };

      const defn = new Oas(circularOas);
      await defn.dereference();

      const comp = shallow(<ResponseSchemaBody oas={defn} schema={defn.components.schemas.test} />);

      expect(comp.find('tr')).toHaveLength(0);
    });

    it('should do its best to recognize that a circular ref is present', async () => {
      circularOas.components.schemas.test = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
            },
            fields: {
              $ref: '#/components/schemas/Customfields',
            },
          },
        },
      };

      const defn = new Oas(circularOas);
      await defn.dereference();

      const comp = shallow(<ResponseSchemaBody oas={defn} schema={defn.components.schemas.test} />);

      expect(comp.find('tr')).toHaveLength(2);

      expect(comp.find('tr').at(0).find('th').text()).toBe('Number');
      expect(comp.find('tr').at(0).find('td').text()).toBe('id');

      expect(comp.find('tr').at(1).find('th').text()).toBe('Circular');
      expect(comp.find('tr').at(1).find('td').text()).toBe('fields');
    });
  });
});
