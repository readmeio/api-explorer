const React = require('react');
const { shallow } = require('enzyme');

const ResponseSchemaBody = require('../src/ResponseSchemaBody');
const Oas = require('../src/lib/Oas');
const petstore = require('./fixtures/petstore/circular-oas');

const oas = new Oas(petstore);

const props = {
  operation: oas.operation('/pet/{petId}', 'get'),
};

const operation = { ...props };

console.log(operation.operation.responses['200'].content['application/json'].schema.properties);

test('should display response schema description', () => {
  const responseSchemaBody = shallow(<ResponseSchemaBody {...props} />);

  expect(responseSchemaBody.containsAnyMatchingElements([<th>items</th>, <td>string</td>])).toBe(
    true,
  );
});
