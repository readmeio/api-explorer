const React = require('react');
const { shallow } = require('enzyme');

const ResponseSchemaBody = require('../src/ResponseSchemaBody');
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
      name: {
        type: 'string',
        example: 'doggie',
      },
      photoUrls: {
        type: 'array',
        xml: {
          name: 'photoUrl',
          wrapped: true,
        },
        items: {
          type: 'string',
        },
      },
      tags: {
        type: 'array',
        xml: {
          name: 'tag',
          wrapped: true,
        },
        items: {
          $ref: '#/components/schemas/Tag',
        },
      },
      status: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
    },
    xml: {
      name: 'Pet',
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
