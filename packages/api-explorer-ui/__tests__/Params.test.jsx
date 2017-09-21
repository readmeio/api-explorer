const React = require('react');
const { shallow } = require('enzyme');
const Params = require('../src/Params');

const Oas = require('../src/lib/Oas');
const petstore = require('./fixtures/petstore/oas.json');

const oas = new Oas(petstore);
const operation = oas.operation('/pet/{petId}', 'get');

const props = {
  oas,
  operation,
  formData: {},
  onChange: () => {},
  onSubmit: () => {},
};

describe('form id attribute', () => {
  test('should be set to the operationId', () => {
    expect(shallow(<Params {...props} />).find(`#form-${operation.operationId}`).length).toBe(1);
  });
});
