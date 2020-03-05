const React = require('react');
const { shallow } = require('enzyme');
const Oas = require('@readme/oas-tooling');

const PathUrl = require('../src/PathUrl');

const { splitPath } = PathUrl;

const { Operation } = Oas;
const petstore = require('./__fixtures__/petstore/oas');

const oas = new Oas(petstore);

const props = {
  apiKey: '',
  dirty: false,
  loading: false,
  oas,
  oauth: false,
  onChange: () => {},
  onGroupChange: () => {},
  onSubmit: () => {},
  operation: oas.operation('/pet/{petId}', 'get'),
  toggleAuth: () => {},
};

test('should display the path', () => {
  const pathUrl = shallow(<PathUrl {...props} />);

  expect(pathUrl.find('span.url').text()).toBe(oas.servers[0].url);
  expect(pathUrl.find('span.api-text').text()).toBe('/pet/');
  expect(pathUrl.find('span.api-variable').text()).toBe('petId');
});

describe('loading prop', () => {
  it('should toggle try it visibility', () => {
    expect(shallow(<PathUrl {...props} loading={false} />).find('.try-it-now-btn')).toHaveLength(1);

    expect(shallow(<PathUrl {...props} loading />).find('.try-it-now-btn')).toHaveLength(0);
  });

  it('should toggle progress visibility', () => {
    expect(shallow(<PathUrl {...props} loading />).find('.fa-spin')).toHaveLength(1);

    expect(shallow(<PathUrl {...props} loading={false} />).find('.fa-spin')).toHaveLength(0);
  });

  it('should disable submit button when loading', () => {
    expect(shallow(<PathUrl {...props} loading />).find('button[disabled=true]')).toHaveLength(1);

    expect(shallow(<PathUrl {...props} loading={false} />).find('button[disabled=false]')).toHaveLength(1);
  });
});

describe('dirty prop', () => {
  it('should add active class', () => {
    expect(shallow(<PathUrl {...props} dirty />).find('button.active')).toHaveLength(1);

    expect(shallow(<PathUrl {...props} dirty={false} />).find('button.active')).toHaveLength(0);
  });
});

test('button click should call onSubmit', () => {
  let called = false;
  function onSubmit() {
    called = true;
  }

  shallow(
    <PathUrl {...props} onSubmit={onSubmit} operation={new Operation({}, '/path', 'get', { operationId: '123' })} />
  )
    .find('button[type="submit"]')
    .simulate('click');

  expect(called).toBe(true);
});

describe('splitPath()', () => {
  it('should work for multiple path params', () => {
    expect(splitPath('/{a}/{b}/c')).toHaveLength(5);
    expect(splitPath('/v1/flight/{FlightID}/sitezonetargeting/{SiteZoneTargetingID}')).toHaveLength(4);
  });

  it('should create unique keys for duplicate values', () => {
    expect(splitPath('/{test}/')).toStrictEqual([
      { key: '/-0', type: 'text', value: '/' },
      { key: 'test-1', type: 'variable', value: 'test' },
      { key: '/-2', type: 'text', value: '/' },
    ]);
  });
});
