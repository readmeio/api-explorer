const React = require('react');
const { shallow } = require('enzyme');

const ResponseSchema = require('../src/ResponseSchema');
const Oas = require('../src/lib/Oas');
const petstore = require('./fixtures/petstore/oas.json');

const { Operation } = Oas;
const oas = new Oas(petstore);

const props = {
  operation: oas.operation('/pet/{petId}', 'get'),
  oas,
};

test('should display a header with a dropdown', () => {
  const responseSchema = shallow(<ResponseSchema {...props} />);

  expect(responseSchema.find('h3').text()).toContain('Response');
  expect(responseSchema.find('select option').map(el => el.text())).toEqual(['200', '400', '404']);
});

test('selectedStatus should change state of selectedStatus', () => {
  const responseSchema = shallow(<ResponseSchema {...props} />);

  expect(responseSchema.state('selectedStatus')).toBe('200');
  responseSchema.instance().selectedStatus('400');

  expect(responseSchema.state('selectedStatus')).toBe('400');
});

test('should display response schema description', () => {
  const responseSchema = shallow(<ResponseSchema {...props} />);

  expect(
    responseSchema
      .find('p.desc')
      .first()
      .text(),
  ).toBe(props.operation.responses['200'].description);
});

test('should work if there are no responses', () => {
  // Need to create a new operation without any responses
  const responseSchema = shallow(
    <ResponseSchema
      operation={
        new Operation(
          {},
          '/',
          'get',
          Object.assign({}, oas.operation('/pet/{petId}', 'get'), { responses: undefined }),
        )
      }
      oas={oas}
    />,
  );

  expect(responseSchema.html()).toBe(null);
});

test('should work if responses is an empty object', () => {
  const responseSchema = shallow(
    <ResponseSchema
      operation={
        new Operation(
          {},
          '/',
          'get',
          Object.assign({}, oas.operation('/pet/{petId}', 'get'), { responses: {} }),
        )
      }
      oas={oas}
    />,
  );

  expect(responseSchema.html()).toBe(null);
});

test('should contain ResponseSchemaBody element if $ref exist for "application/json"', () => {
  const responseSchema = shallow(<ResponseSchema {...props} />);
  expect(responseSchema.text()).toContain('ResponseSchemaBody');
});

test('should not contain ResponseSchemaBody element if $ref not exist', () => {
  const testProps = {
    operation: new Operation(
      {},
      '/',
      'get',
      Object.assign({}, oas.operation('/pet/{petId}', 'get'), { responses: {} }),
    ),
    oas,
  };
  const responseSchema = shallow(<ResponseSchema {...testProps} />);
  expect(responseSchema.find('table').length).toBe(0);
});

test('should show "string" response type', () => {
  const testProps = {
    operation: oas.operation('/user/login', 'get'),
    oas,
  };

  const responseSchema = shallow(<ResponseSchema {...testProps} />);
  expect(
    responseSchema
      .find('p span')
      .last()
      .text(),
  ).toBe('string');
});

test('should show "object" response schema type', () => {
  const testProps = {
    operation: oas.operation('/store/inventory', 'get'),
    oas,
  };

  const responseSchema = shallow(<ResponseSchema {...testProps} />);
  expect(
    responseSchema
      .find('p span')
      .last()
      .text(),
  ).toBe('object');
});

test('should show "array" response schema type', () => {
  const testProps = {
    operation: oas.operation('/pet/findByTags', 'get'),
    oas,
  };

  const responseSchema = shallow(<ResponseSchema {...testProps} />);
  expect(
    responseSchema
      .find('p span')
      .last()
      .text(),
  ).toBe('array of objects');
});

test('should render schema type from "application/json"', () => {
  const testProps = {
    operation: new Operation(
      {},
      '/',
      'get',
      Object.assign({}, oas.operation('/pet/findByTags', 'get'), {
        responses: {
          '200': {
            content: {
              'application/json': {
                description: 'successful operation',
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      }),
    ),
    oas,
  };

  const responseSchema = shallow(<ResponseSchema {...testProps} />);
  expect(
    responseSchema
      .find('p span')
      .last()
      .text(),
  ).toBe('string');
});

test('should contain ResponseSchemaBody element if $ref exist for "application/xml"', () => {
  const testProps = {
    operation: new Operation(
      oas,
      '/',
      'get',
      Object.assign({}, oas.operation('/pet/{petId}', 'get'), {
        responses: {
          '200': {
            content: {
              'application/xml': {
                description: 'successful operation',
                schema: {
                  $ref: '#/components/schemas/Pet',
                },
              },
            },
          },
        },
      }),
    ),
    oas,
  };

  const responseSchema = shallow(<ResponseSchema {...testProps} />);
  expect(responseSchema.text()).toContain('ResponseSchemaBody');
});

test('should change selectedStatus in component', () => {
  const responseSchema = shallow(<ResponseSchema {...props} />);

  const selectedStatus = responseSchema.state().selectedStatus;
  // const selectedStatus = responseSchema.instance().selectedStatus

  responseSchema.instance().changeHandler({ target: { value: '404' } });
  const newSelectedStatus = responseSchema.state().selectedStatus;
  expect(selectedStatus).toEqual('200');
  expect(newSelectedStatus).toEqual('404');
});

test('should show "object" response schema type for "application/xml" content', () => {
  const testProps = {
    operation: new Operation(
      {},
      '/',
      'get',
      Object.assign({}, oas.operation('/pet/findByTags', 'get'), {
        responses: {
          '200': {
            content: {
              'application/xml': {
                description: 'successful operation',
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'integer',
                      format: 'int32',
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ),
    oas,
  };

  const responseSchema = shallow(<ResponseSchema {...testProps} />);
  expect(
    responseSchema
      .find('p span')
      .last()
      .text(),
  ).toBe('object');
});

test('should not break if schema property missing', () => {
  const testProps = {
    operation: new Operation(
      {},
      '/',
      'get',
      Object.assign({}, oas.operation('/pet/findByTags', 'get'), {
        responses: {
          '200': {
            content: {
              'application/xml': {
                description: 'successful operation',
              },
            },
          },
        },
      }),
    ),
    oas,
  };

  const responseSchema = shallow(<ResponseSchema {...testProps} />);
  expect(responseSchema.find('table').length).toBe(0);
});
