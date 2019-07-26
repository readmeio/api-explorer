const React = require('react');
const { mount } = require('enzyme');
const extensions = require('@mia-platform/oas-extensions');

const Description = require('../src/form-components/DescriptionField');

const createParams = require('../src/Params');

const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
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

const Params = createParams(oas);

test('should use custom description component', () => {
  const params = mount(
    <div>
      <Params {...props} />
    </div>,
  );
  expect(params.find(Description).length).toBe(1);
});

test('boolean should render as <select>', () => {
  const params = mount(
    <div>
      <Params {...props} operation={oas.operation('/store/order', 'post')} />
    </div>,
  );
  expect(params.find('input[type="checkbox"]').length).toBe(0);

  const select = params.find('.field-boolean select');

  expect(select.length).toBe(1);
  expect(select.find('option').length).toBe(2);
  expect(select.find('option').map(el => el.text())).toEqual(['true', 'false']);
});

const jsonOperation = new Operation(oas, '/path', 'post', {
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['a'],
          properties: {
            a: {
              type: 'string',
              format: 'json',
            },
          },
        },
      },
    },
  },
});

test('json should render as <textarea>', () => {
  const params = mount(
    <div>
      <Params {...props} operation={jsonOperation} />
    </div>,
  );

  expect(params.find('textarea').length).toBe(1);
  expect(params.find('.field-json').length).toBe(1);
});

test('{ type: string, format: binary } should render as <input type="file">', () => {
  const params = mount(
    <div>
      <Params {...props} operation={oas.operation('/pet/{petId}/uploadImage', 'post')} />
    </div>,
  );

  expect(params.find('input[type="file"]').length).toBe(1);
  expect(params.find('.field-file').length).toBe(1);
});

function renderParams(schema, customProps) {
  return mount(
    <div>
      <Params
        {...props}
        {...customProps}
        operation={
          new Operation(oas, '/path', 'post', {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      a: schema,
                    },
                  },
                },
              },
            },
          })
        }
      />
    </div>,
  );
}

function testNumberClass(schema) {
  test(`${JSON.stringify(schema)} should have correct class`, () => {
    const params = renderParams(schema);

    expect(params.find(`.field-${schema.type}.field-${schema.format}`).length).toBe(1);
  });
}

testNumberClass({ type: 'integer', format: 'int32' });
testNumberClass({ type: 'integer', format: 'int64' });
testNumberClass({ type: 'number', format: 'float' });
testNumberClass({ type: 'number', format: 'double' });

test('should not error if `integer|number` are missing `format`', () => {
  expect(() => {
    renderParams({ type: 'integer' });
  }).not.toThrow(/Cannot read property 'match' of undefined/);
});

test('should default integer to int32 if missing format', () => {
  const params = renderParams({ type: 'integer' });

  expect(params.find(`.field-integer.field-int32`).length).toBe(1);
});

test('should default number to float if missing format', () => {
  const params = renderParams({ type: 'number' });

  expect(params.find(`.field-number.field-float`).length).toBe(1);
});

describe('x-explorer-enabled', () => {
  const oasWithExplorerDisabled = Object.assign({}, oas, { [extensions.EXPLORER_ENABLED]: false });
  const ParamsWithExplorerDisabled = createParams(oasWithExplorerDisabled);

  test('array should not show add button', () => {
    expect(
      mount(
        <ParamsWithExplorerDisabled
          {...props}
          oas={new Oas(oasWithExplorerDisabled)}
          operation={oas.operation('/pet', 'post')}
        />,
      ).find('.field-array .array-item-add').length,
    ).toBe(0);
  });

  test('should not render any <input>', () => {
    expect(
      mount(<ParamsWithExplorerDisabled {...props} oas={new Oas(oasWithExplorerDisabled)} />).find(
        'input',
      ).length,
    ).toBe(0);
  });

  test('should not render any <select>', () => {
    expect(
      mount(
        <ParamsWithExplorerDisabled
          {...props}
          oas={new Oas(oasWithExplorerDisabled)}
          operation={oas.operation('/pet', 'post')}
        />,
      ).find('select').length,
    ).toBe(0);
  });

  test('should not render any <textarea>', () => {
    expect(
      mount(
        <ParamsWithExplorerDisabled
          {...props}
          oas={new Oas(oasWithExplorerDisabled)}
          operation={jsonOperation}
        />,
      ).find('textarea').length,
    ).toBe(0);
  });

  test('should not render any <input type="file">', () => {
    expect(
      mount(
        <ParamsWithExplorerDisabled
          {...props}
          oas={new Oas(oasWithExplorerDisabled)}
          operation={oas.operation('/pet/{petId}/uploadImage', 'post')}
        />,
      ).find('input[type="file"]').length,
    ).toBe(0);
  });
});

test('defaults should be applied on first render', done => {
  const defaultValue = 'this is a default value';
  function onChange(data) {
    const {formData} = data
    expect(formData.body).toEqual({ a: defaultValue });
    return done();
  }

  renderParams({ type: 'string', default: defaultValue }, { onChange });
});
