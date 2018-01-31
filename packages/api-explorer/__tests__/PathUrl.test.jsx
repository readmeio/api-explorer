const React = require('react');
const { shallow } = require('enzyme');
const PathUrl = require('../src/PathUrl');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const petstore = require('./fixtures/petstore/oas');

const oas = new Oas(petstore);

const props = {
  oas,
  operation: oas.operation('/pet/{petId}', 'get'),
  dirty: false,
  loading: false,
  onChange: () => {},
  toggleAuth: () => {},
  onSubmit: () => {},
  oauth: false,
  apiKey: '',
};

test('should display the path', () => {
  const pathUrl = shallow(<PathUrl {...props} />);

  expect(pathUrl.find('span.url').text()).toBe(oas.servers[0].url);
  expect(pathUrl.find('span.api-text').text()).toBe('/pet/');
  expect(pathUrl.find('span.api-variable').text()).toBe('petId');
});

describe('loading prop', () => {
  test('should toggle try it visibility', () => {
    expect(shallow(<PathUrl {...props} loading={false} />).find('.try-it-now-btn').length).toBe(1);

    expect(shallow(<PathUrl {...props} loading />).find('.try-it-now-btn').length).toBe(0);
  });

  test('should toggle progress visibility', () => {
    expect(shallow(<PathUrl {...props} loading />).find('.fa-spin').length).toBe(1);

    expect(shallow(<PathUrl {...props} loading={false} />).find('.fa-spin').length).toBe(0);
  });

  test('should disable submit button when loading', () => {
    expect(shallow(<PathUrl {...props} loading />).find('button[disabled=true]').length).toBe(1);

    expect(
      shallow(<PathUrl {...props} loading={false} />).find('button[disabled=false]').length,
    ).toBe(1);
  });
});

describe('dirty prop', () => {
  test('should add active class', () => {
    expect(shallow(<PathUrl {...props} dirty />).find('button.active').length).toBe(1);

    expect(shallow(<PathUrl {...props} dirty={false} />).find('button.active').length).toBe(0);
  });
});

test('button click should call onSubmit', () => {
  let called = false;
  function onSubmit() {
    called = true;
  }

  shallow(
    <PathUrl
      {...props}
      operation={new Operation({}, '/path', 'get', { operationId: '123' })}
      onSubmit={onSubmit}
    />,
  )
    .find('button[type="submit"]')
    .simulate('click');

  expect(called).toBe(true);
});
