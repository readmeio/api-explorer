const React = require('react');
const { shallow } = require('enzyme');

const ResponseSchema = require('../src/ResponseSchema');
const Oas = require('../src/lib/Oas');
const petstore = require('./fixtures/petstore/oas.json');

const oas = new Oas(petstore);

const props = {
  operation: oas.operation('/pet/{petId}', 'get'),
};

describe('selectedStatus', () => {
  test('selectedStatus should change state of selectedStatus', () => {
    const responseSchema = shallow(<ResponseSchema {...props} />);

    expect(responseSchema.state('selectedStatus')).toBe('200');

    responseSchema.instance().selectedStatus('400');

    expect(responseSchema.state('selectedStatus')).toBe('400');
  });
});

describe('ResponseSchema', () => {
  test('should display response schema', () => {
    const responseSchema = shallow(<ResponseSchema {...props} />);

    expect(responseSchema.find('p.desc').text()).toBe(props.operation.responses['200'].description);
  });
});
