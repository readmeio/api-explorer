const React = require('react');
const { mount } = require('enzyme');
const extensions = require('@readme/oas-extensions');
const Oas = require('oas');
const { ADDITIONAL_PROPERTY_FLAG } = require('react-jsonschema-form/lib/utils');

const Description = require('../src/form-components/DescriptionField');
const createParams = require('../src/Params');

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
    </div>
  );
}

describe('form id attribute', () => {
  it('should be set to the operationId', () => {
    expect(
      mount(
        <div>
          <Params {...props} />
        </div>
      )
        .html()
        .match(new RegExp(`form-${operation.operationId}`, 'g'))
    ).toHaveLength(1);
  });
});

test('should use custom description component', () => {
  const params = mount(
    <div>
      <Params {...props} />
    </div>
  );
  expect(params.find(Description)).toHaveLength(1);
});

test('boolean should render as <select>', () => {
  const params = mount(
    <div>
      <Params {...props} operation={booleanOas.operation('/boolean-with-default', 'get')} />
    </div>
  );
  expect(params.find('input[type="checkbox"]')).toHaveLength(0);

  const select = params.find('.field-boolean select');

  expect(select).toHaveLength(1);
  expect(select.find('option')).toHaveLength(2);
  expect(select.find('option').map(el => el.text())).toStrictEqual(['true', 'false']);
});

test('boolean should render empty item if default is undefined', () => {
  const params = mount(
    <div>
      <Params {...props} operation={booleanOas.operation('/boolean-without-default', 'get')} />
    </div>
  );
  expect(params.find('input[type="checkbox"]')).toHaveLength(0);

  const select = params.find('.field-boolean select');

  expect(select).toHaveLength(1);
  expect(select.find('option')).toHaveLength(3);
  expect(select.find('option').map(el => el.text())).toStrictEqual(['', 'true', 'false']);
});

test('should not throw on unknown string format', () => {
  expect(() => {
    mount(
      <div>
        <Params {...props} operation={stringOas.operation('/format-unknown', 'get')} />
      </div>
    );
  }).not.toThrow(/No widget "some-unknown-format" for type "string"/);

  const params = mount(
    <div>
      <Params {...props} operation={stringOas.operation('/format-unknown', 'get')} />
    </div>
  );

  expect(params.find('input')).toHaveLength(1);
});

test('should convert `mixed type` to string', () => {
  const params = renderParams({ type: 'mixed type' });

  expect(params.find(`.field-string`)).toHaveLength(1);
});

test('additionalProperties object labels (keys) should be editable', () => {
  const params = renderParams({
    type: 'object',
    additionalProperties: true,
    // RJSF adds this property if you go through the `Form` object, but we aren't here so we're
    // faking it.
    [ADDITIONAL_PROPERTY_FLAG]: true,
  });

  expect(params.find('input#root_a-key')).toHaveLength(1);
});

describe('schema format handling', () => {
  describe('string types', () => {
    it('json should render as <textarea>', () => {
      const params = mount(
        <div>
          <Params {...props} operation={jsonOperation} />
        </div>
      );

      expect(params.find('textarea')).toHaveLength(1);
      expect(params.find('.field-json')).toHaveLength(1);
      expect(params.find('span.label-type').text()).toBe('json');
    });

    it('binary should render as <input type="file">', () => {
      const params = mount(
        <div>
          <Params {...props} operation={oas.operation('/pet/{petId}/uploadImage', 'post')} />
        </div>
      );

      expect(params.find('input[type="file"]')).toHaveLength(1);
      expect(params.find('.field-file')).toHaveLength(1);
    });

    it.each([
      ['password', 'password', stringOas.operation('/format-password', 'get'), 'password'],
      ['date', 'text', stringOas.operation('/format-date', 'get'), 'date'],
      ['date-time', 'datetime-local', stringOas.operation('/format-date-time', 'get'), 'date-time'],
      ['dateTime', 'datetime-local', stringOas.operation('/format-dateTime', 'get'), 'date-time'],
      ['uri', 'url', stringOas.operation('/format-uri', 'get'), 'uri'],
      ['url', 'url', stringOas.operation('/format-url', 'get'), 'url'],
    ])(`%s should render as <input type="%s">`, (type, inputType, stringOperation, label) => {
      const params = mount(
        <div>
          <Params {...props} operation={stringOperation} />
        </div>
      );

      expect(params.find(`input[type="${inputType}"]`)).toHaveLength(1);
      expect(params.find('span.label-type').text()).toBe(label);
    });
  });

  describe('number types', () => {
    it.each([
      ['integer', 'int8'],
      ['integer', 'int16'],
      ['integer', 'int32'],
      ['integer', 'int64'],
      ['integer', 'uint8'],
      ['integer', 'uint16'],
      ['integer', 'uint32'],
      ['integer', 'uint64'],
      ['number', 'double'],
      ['number', 'float'],
    ])(`%ss with a %s format should render as <input type="number">`, (type, format) => {
      const schema = { type, format };
      const clonedSchema = JSON.parse(JSON.stringify(schema));
      const params = renderParams(schema);

      expect(params.find('input[type="number"]')).toHaveLength(1);
      expect(params.find('span.label-type').text()).toBe(format);
      expect(params.find(`.field-${clonedSchema.type}.field-${clonedSchema.format}`)).toHaveLength(1);
    });

    it('should default integer to int32 if missing format', () => {
      const params = renderParams({ type: 'integer' });

      expect(params.find(`.field-integer.field-int32`)).toHaveLength(1);
    });

    it('should not error if `integer|number` are missing `format`', () => {
      expect(() => {
        renderParams({ type: 'integer' });
      }).not.toThrow(/Cannot read property 'match' of undefined/);
    });

    it('should default number to float if missing format', () => {
      const params = renderParams({ type: 'number' });

      expect(params.find(`.field-number.field-float`)).toHaveLength(1);
    });
  });
});

describe('x-explorer-enabled', () => {
  const oasWithExplorerDisabled = { ...oas, [extensions.EXPLORER_ENABLED]: false };
  const ParamsWithExplorerDisabled = createParams(oasWithExplorerDisabled);

  it('array should still show add button, but sub-elements should not be editable', () => {
    const elem = mount(
      <ParamsWithExplorerDisabled
        {...props}
        oas={new Oas(oasWithExplorerDisabled)}
        operation={oas.operation('/pet', 'post')}
      />
    );

    expect(elem.find('.field-array .array-item-add')).toHaveLength(2);

    elem
      .find('.field-array .array-item-add')
      .at(0)
      .simulate('click');

    // Assert that after we've clicked to add array items into the view, everything is still in
    // readOnly mode.
    expect(elem.find('input')).toHaveLength(1);
    expect(
      elem
        .find('input')
        .at(0)
        .props().type
    ).toBe('hidden');
  });

  it('should not render any <input>', () => {
    expect(
      mount(<ParamsWithExplorerDisabled {...props} oas={new Oas(oasWithExplorerDisabled)} />).find('input')
    ).toHaveLength(0);
  });

  it('should not render any <select>', () => {
    expect(
      mount(
        <ParamsWithExplorerDisabled
          {...props}
          oas={new Oas(oasWithExplorerDisabled)}
          operation={oas.operation('/pet', 'post')}
        />
      ).find('select')
    ).toHaveLength(0);
  });

  it('should not render any <textarea>', () => {
    expect(
      mount(
        <ParamsWithExplorerDisabled {...props} oas={new Oas(oasWithExplorerDisabled)} operation={jsonOperation} />
      ).find('textarea')
    ).toHaveLength(0);
  });

  it('should not render any <input type="file">', () => {
    expect(
      mount(
        <ParamsWithExplorerDisabled
          {...props}
          oas={new Oas(oasWithExplorerDisabled)}
          operation={oas.operation('/pet/{petId}/uploadImage', 'post')}
        />
      ).find('input[type="file"]')
    ).toHaveLength(0);
  });

  it('should not render any <input type="url">', () => {
    expect(
      mount(
        <ParamsWithExplorerDisabled
          {...props}
          oas={new Oas(oasWithExplorerDisabled)}
          operation={oas.operation('/pet/{petId}', 'post')}
        />
      ).find('input[type="file"]')
    ).toHaveLength(0);
  });
});

describe('readOnly', () => {
  it('should make `readOnly` properties hidden', () => {
    expect(
      mount(
        <div>
          <Params {...props} operation={oas.operation('/pet', 'post')} />
        </div>
      ).find('input#addPet_id[type="hidden"]')
    ).toHaveLength(1);
  });
});

test('defaults should be applied on first render', () => {
  expect.assertions(1);
  return new Promise(done => {
    const defaultValue = 'this is a default value';
    function onChange(formData) {
      expect(formData.body).toStrictEqual({ a: defaultValue });
      return done();
    }

    renderParams({ type: 'string', default: defaultValue }, { onChange });
  });
});

describe('should not contains error message when property key missing in object type', () => {
  it('should make `readOnly` properties hidden', () => {
    expect(
      mount(
        <div>
          <Params {...props} operation={oas.operation('/pet/{petId}', 'post')} />
        </div>
      ).html()
    ).not.toContain('Invalid empty object object field configuration');
  });
});
