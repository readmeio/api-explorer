const React = require('react');
const { shallow } = require('enzyme');

const Response = require('../src/Response');
const Oas = require('../src/lib/Oas');
const petstore = require('./fixtures/petstore/oas.json');

const oas = new Oas(petstore);

const props = {
  operation: oas.operation('/pet/{petId}', 'get')
};

describe('selectedStatus', () => {
  test('selectedStatus should change state of selectedStatus', () => {
    const response = shallow(<Response {...props} />);

    expect(response.state('selectedStatus')).toBe('200');

    response.instance().selectedStatus('400');

    expect(response.state('selectedStatus')).toBe('400');
  });
});

describe('Response', () => {
  test('should display Response schema', () => {
    const response = shallow(<Response {...props} />);

    expect(response.find('p.desc').text()).toBe(props.operation.responses['200'].description);
  });
});
