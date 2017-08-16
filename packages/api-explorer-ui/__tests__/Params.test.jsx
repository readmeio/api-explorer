const React = require('react');
const { shallow } = require('enzyme');
const Params = require('../src/Params');

const oas = require('./fixtures/petstore/oas');

const path = '/pet/{petId}';
const method = 'get';
const pathOperation = oas.paths[path][method];

const props = { oas, pathOperation, formData: {}, onChange: () => {} };

describe('form id attribute', () => {
  test('should be set to the operationId', () => {
    expect(shallow(
      <Params {...props} />,
    ).find(`#form-${pathOperation.operationId}`).length).toBe(1);
  });
});
