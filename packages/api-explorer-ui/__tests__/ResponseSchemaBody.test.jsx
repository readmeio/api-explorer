const React = require('react');
const { shallow } = require('enzyme');

const ResponseSchemaBody = require('../src/ResponseSchemaBody');
const { recurse } = require('../src/ResponseSchemaBody');
const Oas = require('../src/lib/Oas');
const petstore = require('./fixtures/petstore/circular-oas');

const oas = new Oas(petstore);

const props = {
  operation: oas.operation('/pet/{petId}', 'get'),
};

// const operation = { ...props };

// console.log(operation.operation.responses['200'].content['application/json'].schema.properties);

test('should display response schema description', () => {
  const responseSchemaBody = shallow(<ResponseSchemaBody {...props} />);

  expect(responseSchemaBody.containsAnyMatchingElements([<th>items</th>, <td>string</td>])).toBe(
    true,
  );
});

test.only('should flatten object', () => {
  const responseSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
    },
  };
  const parent = '';
  expect(recurse(responseSchema, parent)).to.equal([
    <tr>
      <th>name</th>
      <td>string</td>
    </tr>,
  ]);
});

test.only('should flatten nested object', () => {
  const responseSchema = {
    type: 'object',
    properties: {
      category: {
        type: 'object',
        tag: {
          type: 'object',
          name: { type: 'string' },
        },
      },
    },
  };
  const parent = '';
  expect(recurse(responseSchema, parent)).to.equal([
    <tr>
      <th>category</th>
      <td>object</td>
    </tr>,
    <tr>
      <th>category.tag</th>
      <td>object</td>
    </tr>,
    <tr>
      <th>category.tag.name</th>
      <td>string</td>
    </tr>,
  ]);
});

test.only('should flatten array ', () => {
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
  const parent = '';
  expect(recurse(responseSchema, parent)).to.equal([
    <tr>
      <th>category</th>
      <td>array</td>
    </tr>,
    <tr>
      <th>category.items</th>
      <td>string</td>
    </tr>,
  ]);
});

test.only('should flatten array of objects ', () => {
  const responseSchema = {
    type: 'object',
    properties: {
      category: {
        type: 'array',
        items: {
          type: 'object',
          properties: { type: 'string' },
        },
      },
    },
  };
  const parent = '';
  expect(recurse(responseSchema, parent)).to.equal([
    <tr>
      <th>category</th>
      <td>array</td>
    </tr>,
    <tr>
      <th>category.items</th>
      <td>object</td>
    </tr>,
    <tr>
      <th>category.items.properties</th>
      <td>string</td>
    </tr>,
  ]);
});
