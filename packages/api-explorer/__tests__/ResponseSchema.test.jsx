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

  expect(responseSchema.find('p.desc').text()).toBe(props.operation.responses['200'].description);
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
    />,
  );

  expect(responseSchema.html()).toBe(null);
});

test('should contain ResponseSchemaBody element if $ref exist', () => {
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
