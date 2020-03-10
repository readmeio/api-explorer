const React = require('react');
const { shallow, mount } = require('enzyme');
const Cookie = require('js-cookie');
const extensions = require('@readme/oas-extensions');
const WrappedApiExplorer = require('../src');

const { ApiExplorer } = WrappedApiExplorer;

const oas = require('./fixtures/petstore/oas');
const oasCommon = require('./fixtures/parameters/common');

const createDocs = require('../lib/create-docs');

const docs = createDocs(oas, 'api-setting');

const languages = ['node', 'curl'];
const props = {
  appearance: {},
  docs,
  flags: {},
  glossaryTerms: [],
  oasFiles: {
    'api-setting': { ...oas, [extensions.SAMPLES_LANGUAGES]: languages },
  },
  suggestedEdits: false,
  variables: { user: {}, defaults: [] },
};

test('ApiExplorer renders a doc for each', () => {
  const explorer = shallow(<ApiExplorer {...props} />);

  expect(explorer.find('Doc')).toHaveLength(docs.length);
});

test('ApiExplorer should not render a common parameter OAS operation method', () => {
  const docsCommon = createDocs(oasCommon, 'api-setting');
  const propsCommon = {
    ...props,
    docs: docsCommon,
    oasFiles: {
      'api-setting': oasCommon,
    },
  };

  const explorer = shallow(<ApiExplorer {...propsCommon} />);

  // Doc should have neither `servers` or `parameters` from the spec because those aren't real HTTP methods.
  expect(explorer.find('Doc')).toHaveLength(docsCommon.length - 2);
});

test('should display an error message if it fails to render (wrapped in ErrorBoundary)', () => {
  // Prompting an error with an array of nulls instead of Docs
  // This is to simulate some unknown error state during initial render
  const explorer = mount(<WrappedApiExplorer {...props} docs={[null, null]} />);

  expect(explorer.find('ErrorBoundary')).toHaveLength(1);
});

describe('selected language', () => {
  it('should default to curl', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
      />
    );

    expect(explorer.state('language')).toBe('curl');
  });

  it('should auto-select to the first language of the first oas file', () => {
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('language')).toBe(languages[0]);
  });

  describe('#setLanguage()', () => {
    it('should update the language state', () => {
      const explorer = shallow(<ApiExplorer {...props} />);

      explorer.instance().setLanguage('language');
      expect(explorer.state('language')).toBe('language');
      expect(Cookie.get('readme_language')).toBe('language');
    });
  });

  describe('Cookie', () => {
    it('the state of language should be set to Cookie value if provided', () => {
      Cookie.set('readme_language', 'javascript');
      const explorer = shallow(<ApiExplorer {...props} />);

      expect(explorer.state('language')).toBe('javascript');
    });
  });

  it('the state of language should be the first language defined if cookie has not been set', () => {
    Cookie.remove('readme_language');
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('language')).toBe('node');
  });

  it('the state of language should be defaulted to curl if no cookie is present and languages have not been defined', () => {
    Cookie.remove('readme_language');
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
      />
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
        docs={[{ ...baseDoc, category: { apiSetting: 'api-setting' } }]}
        oasFiles={{
          'api-setting': oas,
        }}
      />
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  // Some other legacy APIs where Endpoints are created in arbitrary categories
  it('should fetch it from `doc.api.apiSetting._id`', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        docs={[{ ...baseDoc, api: { method: 'get', apiSetting: { _id: 'api-setting' } } }]}
        oasFiles={{
          'api-setting': oas,
        }}
      />
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  it('should fetch it from `doc.api.apiSetting` if it is a string', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        docs={[{ ...baseDoc, api: { method: 'get', apiSetting: 'api-setting' } }]}
        oasFiles={{
          'api-setting': oas,
        }}
      />
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  // Of course... `typeof null === 'object'`
  it('should not error if `doc.api.apiSetting` is null', () => {
    const explorer = shallow(
      <ApiExplorer {...props} docs={[{ ...baseDoc, api: { method: 'get', apiSetting: null } }]} />
    );

    expect(explorer.find('Doc').get(0).props.oas).toStrictEqual({});
  });

  it('should set it to empty object', () => {
    const explorer = shallow(<ApiExplorer {...props} docs={[baseDoc]} />);

    expect(explorer.find('Doc').get(0).props.oas).toStrictEqual({});
  });
});

describe('auth', () => {
  it('should read apiKey from `variables.user.apiKey`', () => {
    const apiKey = '123456';

    const explorer = shallow(<ApiExplorer {...props} variables={{ user: { apiKey } }} />);

    expect(explorer.state('auth')).toStrictEqual({ api_key: '123456', petstore_auth: '123456' });
  });

  it('should read apiKey from `variables.user.keys[].apiKey`', () => {
    const apiKey = '123456';

    const explorer = shallow(<ApiExplorer {...props} variables={{ user: { keys: [{ name: 'a', apiKey }] } }} />);

    expect(explorer.state('auth')).toStrictEqual({ api_key: '123456', petstore_auth: '123456' });
  });

  it('should read apiKey from `user_data.keys[].api_key`', () => {
    const apiKey = '123456';

    const explorer = shallow(
      <ApiExplorer {...props} variables={{ user: { keys: [{ name: 'project1', api_key: apiKey }] } }} />
    );

    expect(explorer.state('auth')).toStrictEqual({ api_key: '123456', petstore_auth: '' });
  });

  it('should return nothing for lazy + `splitReferenceDocs`', () => {
    const explorer = shallow(<ApiExplorer {...props} appearance={{ splitReferenceDocs: true }} />);

    const { lazyHash } = explorer.instance();
    expect(lazyHash).toStrictEqual({});
  });

  it('should disable lazy render first 5 projects', () => {
    const explorer = shallow(<ApiExplorer {...props} />);

    const { lazyHash } = explorer.instance();
    expect(lazyHash[0]).toBe(false);
    expect(lazyHash[1]).toBe(false);
    expect(lazyHash[2]).toBe(false);
    expect(lazyHash[3]).toBe(false);
    expect(lazyHash[4]).toBe(false);
    expect(lazyHash[5]).toBe(true);
  });

  it('should disable lazy render middle 5 projects', () => {
    // somewhere in the middle of props.docs
    window.history.pushState({}, '', '/#user-createWithArray');
    const explorer = shallow(<ApiExplorer {...props} />);

    const instance = explorer.instance();
    const slugs = instance.props.docs.map(x => x.slug);
    const centerIdx = slugs.indexOf('user-createWithArray');

    expect(instance.lazyHash[centerIdx - 3]).toBe(true);
    expect(instance.lazyHash[centerIdx - 2]).toBe(false);
    expect(instance.lazyHash[centerIdx - 1]).toBe(false);
    expect(instance.lazyHash[centerIdx]).toBe(false);
    expect(instance.lazyHash[centerIdx + 1]).toBe(false);
    expect(instance.lazyHash[centerIdx + 2]).toBe(false);
    expect(instance.lazyHash[centerIdx + 3]).toBe(true);
  });

  it('should disable lazy render for last 5 projects', () => {
    // last doc in props.docs
    window.history.pushState({}, '', '/#user-username');
    const explorer = shallow(<ApiExplorer {...props} />);

    const instance = explorer.instance();
    const slugs = instance.props.docs.map(x => x.slug);
    const centerIdx = slugs.indexOf('user-username');

    expect(instance.lazyHash[centerIdx - 3]).toBe(true);
    expect(instance.lazyHash[centerIdx - 2]).toBe(false);
    expect(instance.lazyHash[centerIdx - 1]).toBe(false);
    expect(instance.lazyHash[centerIdx]).toBe(false);
    expect(instance.lazyHash[centerIdx + 1]).toBe(false);
    expect(instance.lazyHash[centerIdx + 2]).toBe(false);
  });

  it('should default to empty string', () => {
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('auth')).toStrictEqual({ api_key: '', petstore_auth: '' });
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

  it('should merge securities auth changes', () => {
    const explorer = mount(<ApiExplorer {...props} />);

    explorer.instance().onAuthChange({ api_key: '7890' });
    explorer.instance().onAuthChange({ petstore_auth: '123456' });

    expect(explorer.state('auth')).toStrictEqual({ api_key: '7890', petstore_auth: '123456' });
  });
});

describe('onDocRender()', () => {
  it('should set a key to true if passed', () => {
    const explorer = mount(<ApiExplorer {...props} />);
    explorer.instance().onDocRender('123');
    expect(explorer.state('docRenderMap')['123']).toBe(true);
  });
});
