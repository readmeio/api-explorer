const React = require('react');
const { shallow, mount } = require('enzyme');
const Cookie = require('js-cookie');
const extensions = require('@readme/oas-extensions');
const WrappedApiExplorer = require('../src');

const { ApiExplorer } = WrappedApiExplorer;

const oas = require('./fixtures/petstore/oas');

const createDocs = require('../lib/create-docs');

const docs = createDocs(oas, 'api-setting');

const languages = ['node', 'curl'];
const props = {
  docs,
  oasFiles: {
    'api-setting': Object.assign({}, oas, {
      [extensions.SAMPLES_LANGUAGES]: languages,
    }),
  },
  flags: {},
  appearance: {},
  suggestedEdits: false,
  variables: { user: {}, defaults: [] },
  glossaryTerms: [],
};

test('ApiExplorer renders a doc for each', () => {
  const explorer = shallow(<ApiExplorer {...props} />);

  expect(explorer.find('Doc').length).toBe(docs.length);
});

test('Should display an error message if it fails to render (wrapped in ErrorBoundary)', () => {
  // Prompting an error with an array of nulls instead of Docs
  // This is to simulate some unknown error state during initial render
  const explorer = mount(<WrappedApiExplorer {...props} docs={[null, null]} />);

  expect(explorer.find('ErrorBoundary').length).toBe(1);
});

describe('selected language', () => {
  test('should default to curl', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
      />,
    );

    expect(explorer.state('language')).toBe('curl');
  });

  test('should auto-select to the first language of the first oas file', () => {
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('language')).toBe(languages[0]);
  });

  describe('#setLanguage()', () => {
    test('should update the language state', () => {
      const explorer = shallow(<ApiExplorer {...props} />);

      explorer.instance().setLanguage('language');
      expect(explorer.state('language')).toBe('language');
      expect(Cookie.get('readme_language')).toBe('language');
    });
  });

  describe('Cookie', () => {
    test('the state of language should be set to Cookie value if provided', () => {
      Cookie.set('readme_language', 'javascript');
      const explorer = shallow(<ApiExplorer {...props} />);

      expect(explorer.state('language')).toBe('javascript');
    });
  });

  test('the state of language should be the first language defined if cookie has not been set', () => {
    Cookie.remove('readme_language');
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('language')).toBe('node');
  });

  test('the state of language should be defaulted to curl if no cookie is present and languages have not been defined', () => {
    Cookie.remove('readme_language');
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
      />,
    );

    expect(explorer.state('language')).toBe('curl');
  });
});

describe('oas', () => {
  const baseDoc = {
    _id: 1,
    title: 'title',
    slug: 'slug',
    type: 'endpoint',
    category: {},
    api: { method: 'get' },
  };

  // Swagger apis and some legacies
  it('should fetch it from `doc.category.apiSetting`', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
        docs={[Object.assign({}, baseDoc, { category: { apiSetting: 'api-setting' } })]}
      />,
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  // Some other legacy APIs where Endpoints are created in arbitrary categories
  it('should fetch it from `doc.api.apiSetting._id`', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
        docs={[
          Object.assign({}, baseDoc, {
            api: { method: 'get', apiSetting: { _id: 'api-setting' } },
          }),
        ]}
      />,
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  it('should fetch it from `doc.api.apiSetting` if it is a string', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
        docs={[
          Object.assign({}, baseDoc, {
            api: { method: 'get', apiSetting: 'api-setting' },
          }),
        ]}
      />,
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  // Of course... `typeof null === 'object'`
  it('should not error if `doc.api.apiSetting` is null', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        docs={[
          Object.assign({}, baseDoc, {
            api: { method: 'get', apiSetting: null },
          }),
        ]}
      />,
    );

    expect(explorer.find('Doc').get(0).props.oas).toEqual({});
  });

  it('should set it to empty object', () => {
    const explorer = shallow(<ApiExplorer {...props} docs={[baseDoc]} />);

    expect(explorer.find('Doc').get(0).props.oas).toEqual({});
  });
});

describe('auth', () => {
  it('should read apiKey from `variables.user.apiKey`', () => {
    const apiKey = '123456';

    const explorer = shallow(<ApiExplorer {...props} variables={{ user: { apiKey } }} />);

    expect(explorer.state('auth')).toEqual({ api_key: '123456', petstore_auth: '123456' });
  });

  it('should read apiKey from `variables.user.keys[].apiKey`', () => {
    const apiKey = '123456';

    const explorer = shallow(
      <ApiExplorer {...props} variables={{ user: { keys: [{ name: 'a', apiKey }] } }} />,
    );

    expect(explorer.state('auth')).toEqual({ api_key: '123456', petstore_auth: '123456' });
  });

  it('should read apiKey from `user_data.keys[].api_key`', () => {
    const apiKey = '123456';

    const explorer = shallow(
      <ApiExplorer
        {...props}
        variables={{ user: { keys: [{ name: 'project1', api_key: apiKey }] } }}
      />,
    );

    expect(explorer.state('auth')).toEqual({ api_key: '123456', petstore_auth: '' });
  });

  it('should disable lazy render first 5 projects', () => {
    const explorer = shallow(<ApiExplorer {...props} />);

    const { lazyHash } = explorer.instance();
    expect(lazyHash[0]).toEqual(false);
    expect(lazyHash[1]).toEqual(false);
    expect(lazyHash[2]).toEqual(false);
    expect(lazyHash[3]).toEqual(false);
    expect(lazyHash[4]).toEqual(false);
  });

  it('should disable lazy render middle 5 projects', () => {
    // somewhere in the middle of props.docs
    window.history.pushState({}, '', '/#user-createWithArray');
    const explorer = shallow(<ApiExplorer {...props} />);

    const instance = explorer.instance();
    const slugs = instance.props.docs.map(x => x.slug);
    const centerIdx = slugs.indexOf('user-createWithArray');

    expect(instance.lazyHash[centerIdx - 2]).toEqual(false);
    expect(instance.lazyHash[centerIdx - 1]).toEqual(false);
    expect(instance.lazyHash[centerIdx]).toEqual(false);
    expect(instance.lazyHash[centerIdx + 1]).toEqual(false);
    expect(instance.lazyHash[centerIdx + 2]).toEqual(false);
  });

  it('should disable lazy render for last 5 projects', () => {
    // last doc in props.docs
    window.history.pushState({}, '', '/#user-username');
    const explorer = shallow(<ApiExplorer {...props} />);

    const instance = explorer.instance();
    const slugs = instance.props.docs.map(x => x.slug);
    const centerIdx = slugs.indexOf('user-username');

    expect(instance.lazyHash[centerIdx - 2]).toEqual(false);
    expect(instance.lazyHash[centerIdx - 1]).toEqual(false);
    expect(instance.lazyHash[centerIdx]).toEqual(false);
    expect(instance.lazyHash[centerIdx + 1]).toEqual(false);
    expect(instance.lazyHash[centerIdx + 2]).toEqual(false);
  });

  it('should default to empty string', () => {
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('auth')).toEqual({ api_key: '', petstore_auth: '' });
  });

  it('should be updated via editing authbox', () => {
    const explorer = mount(<ApiExplorer {...props} docs={docs.slice(0, 1)} />);
    const doc = explorer
      .find('Doc')
      .at(0)
      .instance();

    doc.setState({ showEndpoint: true, showAuthBox: true });

    explorer.update();

    const input = explorer.find('input[name="apiKey"]');

    input.instance().value = '1234';
    input.simulate('change');

    expect(explorer.state('auth').petstore_auth).toBe('1234');

    input.instance().value += '5678';
    input.simulate('change');

    expect(explorer.state('auth').petstore_auth).toBe('12345678');
  });

  test('should merge securities auth changes', () => {
    const explorer = mount(<ApiExplorer {...props} />);

    explorer.instance().onAuthChange({ api_key: '7890' });
    explorer.instance().onAuthChange({ petstore_auth: '123456' });

    expect(explorer.state('auth')).toEqual({ api_key: '7890', petstore_auth: '123456' });
  });
});
