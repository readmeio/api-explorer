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

test('boolean should render as <select>', () => {
  const params = mount(<div><Params {...props} operation={oas.operation('/store/order', 'post')} /></div>);
  expect(params.find('input[type="checkbox"]').length).toBe(0);

  const select = params.find('.field-boolean select')

  expect(select.length).toBe(1);
  expect(select.find('option').length).toBe(3);
  expect(select.find('option').map(el => el.text())).toEqual(['', 'true', 'false']);
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
