const React = require('react');
const { mount } = require('enzyme');
const extensions = require('@readme/oas-extensions');

const Description = require('../src/form-components/DescriptionField');

const createParams = require('../src/Params');

const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const petstore = require('./fixtures/petstore/oas.json');
const boolean = require('./fixtures/boolean/oas.json');
const string = require('./fixtures/string/oas.json');

const oas = new Oas(petstore);
const operation = oas.operation('/pet/{petId}', 'get');
const booleanOas = new Oas(boolean);
const stringOas = new Oas(string);

const props = {
  formData: {},
  oas,
  onChange: () => {},
  onSubmit: () => {},
  operation,
};

const Params = createParams(oas);

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
      <Params {...props} operation={booleanOas.operation('/boolean-with-default', 'get')} />
    </div>,
  );
  expect(params.find('input[type="checkbox"]').length).toBe(0);

  const select = params.find('.field-boolean select');

  expect(select.length).toBe(1);
  expect(select.find('option').length).toBe(2);
  expect(select.find('option').map(el => el.text())).toEqual(['true', 'false']);
});

test('boolean should render empty item if default is undefined', () => {
  const params = mount(
    <div>
      <Params {...props} operation={booleanOas.operation('/boolean-without-default', 'get')} />
    </div>,
  );
  expect(params.find('input[type="checkbox"]').length).toBe(0);

  const select = params.find('.field-boolean select');

  expect(select.length).toBe(1);
  expect(select.find('option').length).toBe(3);
  expect(select.find('option').map(el => el.text())).toEqual(['', 'true', 'false']);
});

test('should not throw on unknown string format', () => {
  expect(() => {
    mount(
      <div>
        <Params {...props} operation={stringOas.operation('/format-unknown', 'get')} />
      </div>,
    );
  }).not.toThrow(/No widget "some-unknown-format" for type "string"/);

  const params = mount(
    <div>
      <Params {...props} operation={stringOas.operation('/format-unknown', 'get')} />
    </div>,
  );

  expect(params.find('input').length).toBe(1);
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

test('{ type: string, format: url } should render as <input type="url">', () => {
  const params = mount(
    <div>
      <Params {...props} operation={stringOas.operation('/format-url', 'get')} />
    </div>,
  );

  expect(params.find('input[type="url"]').length).toBe(1);
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

test('should convert `mixed type` to string', () => {
  const params = renderParams({ type: 'mixed type' });

  expect(params.find(`.field-string`).length).toBe(1);
});

test.each([
  ['integer', 'int8'],
  ['integer', 'uint8'],
  ['integer', 'int16'],
  ['integer', 'uint16'],
  ['integer', 'int32'],
  ['integer', 'uint32'],
  ['integer', 'int64'],
  ['integer', 'uint64'],
  ['number', 'float'],
  ['number', 'double'],
])('{ type: %s, format: %s } should have correct class', (type, format) => {
  const schema = { type, format };
  const clonedSchema = JSON.parse(JSON.stringify(schema));
  const params = renderParams(schema);

  expect(params.find(`.field-${clonedSchema.type}.field-${clonedSchema.format}`).length).toBe(1);
});

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
  const oasWithExplorerDisabled = { ...oas, [extensions.EXPLORER_ENABLED]: false };
  const ParamsWithExplorerDisabled = createParams(oasWithExplorerDisabled);

  test('array should still show add button, but sub-elements should not be editable', () => {
    const elem = mount(
      <ParamsWithExplorerDisabled
        {...props}
        oas={new Oas(oasWithExplorerDisabled)}
        operation={oas.operation('/pet', 'post')}
      />,
    );

    expect(elem.find('.field-array .array-item-add').length).toBe(2);

    elem
      .find('.field-array .array-item-add')
      .at(0)
      .simulate('click');

    // Assert that after we've clicked to add array items into the view, everything is still in
    // readOnly mode.
    expect(elem.find('input').length).toBe(1);
    expect(
      elem
        .find('input')
        .at(0)
        .props().type,
    ).toBe('hidden');
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

  test('should not render any <input type="url">', () => {
    expect(
      mount(
        <ParamsWithExplorerDisabled
          {...props}
          oas={new Oas(oasWithExplorerDisabled)}
          operation={oas.operation('/pet/{petId}', 'post')}
        />,
      ).find('input[type="file"]').length,
    ).toBe(0);
  });
});

describe('readOnly', () => {
  test('should make `readOnly` properties hidden', () => {
    expect(
      mount(
        <div>
          <Params {...props} operation={oas.operation('/pet', 'post')} />
        </div>,
      ).find('input#addPet_id[type="hidden"]').length,
    ).toBe(1);
  });
});

test('defaults should be applied on first render', done => {
  const defaultValue = 'this is a default value';
  function onChange(formData) {
    expect(formData.body).toEqual({ a: defaultValue });
    return done();
  }

  renderParams({ type: 'string', default: defaultValue }, { onChange });
});

describe('should not contains error message when property key missing in object type', () => {
  test('should make `readOnly` properties hidden', () => {
    expect(
      mount(
        <div>
          <Params {...props} operation={oas.operation('/pet/{petId}', 'post')} />
        </div>,
      )
        .html()
        .includes('Invalid empty object object field configuration'),
    ).toBe(false);
  });
});
