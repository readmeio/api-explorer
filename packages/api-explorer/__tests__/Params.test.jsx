const React = require('react');
const { mount } = require('enzyme');
const extensions = require('@readme/oas-extensions');

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
    expect(
      mount(
        <div>
          <Params {...props} />
        </div>,
      )
        .html()
        .match(new RegExp(`form-${operation.operationId}`, 'g')).length,
    ).toBe(1);
  });
});

describe('x-explorer-enabled', () => {
  const oasWithExplorerDisabled = Object.assign({}, oas, { [extensions.EXPLORER_ENABLED]: false })

  test('array should not show add button', () => {
    expect(
      mount(
        <Params {...props} oas={new Oas(oasWithExplorerDisabled)} operation={oas.operation('/pet', 'post')} />
      ).find('.field-array .array-item-add').length).toBe(0);
  });

  test('should not render any <input>', () => {
    expect(
      mount(
        <Params {...props} oas={new Oas(oasWithExplorerDisabled)} />
      ).find('input').length).toBe(0);
  });
});
