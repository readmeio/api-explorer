const React = require('react');
const { shallow } = require('enzyme');
const Oas = require('oas/tooling');

const PathUrl = require('../src/PathUrl');

const { splitPath } = PathUrl;

const { Operation } = Oas;
const petstore = require('./__fixtures__/petstore/oas.json');

const oas = new Oas(petstore);

const props = {
  apiKey: '',
  dirty: false,
  loading: false,
  oas,
  oauth: false,
  onAuthGroupChange: () => {},
  onChange: () => {},
  onSubmit: () => {},
  operation: oas.operation('/pet/{petId}', 'get'),
  resetForm: () => {},
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

describe('#resetForm()', () => {
  it('should fire when clicked', () => {
    const resetForm = jest.fn();

    shallow(<PathUrl {...props} resetForm={resetForm} validationErrors={'invalid json'} />)
      .find('.api-try-it-out-popover div[role="button"]')
      .simulate('click');

    expect(resetForm).toHaveBeenCalled();
  });
});

describe('#validationErrors', () => {
  it('should not show validation errors if there are none', () => {
    expect(shallow(<PathUrl {...props} />).find('.api-try-it-out-popover')).toHaveLength(0);
  });

  it('should show validation errors', () => {
    expect(
      shallow(<PathUrl {...props} validationErrors={'invalid json'} />).find('.api-try-it-out-popover')
    ).toHaveLength(1);
  });
});

describe('#onSubmit()', () => {
  it('button click should call onSubmit', () => {
    const onSubmit = jest.fn();

    shallow(
      <PathUrl {...props} onSubmit={onSubmit} operation={new Operation({}, '/path', 'get', { operationId: '123' })} />
    )
      .find('button[type="submit"]')
      .simulate('click');

    expect(onSubmit).toHaveBeenCalled();
  });
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
