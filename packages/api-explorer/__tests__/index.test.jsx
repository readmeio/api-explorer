const React = require('react');
const { shallow, mount } = require('enzyme');
const Cookie = require('js-cookie');
const extensions = require('@readme/oas-extensions');
const WrappedApiExplorer = require('../src');
const AuthBox = require('../src/AuthBox');
const ErrorBoundary = require('../src/ErrorBoundary');

const { ApiExplorer } = WrappedApiExplorer;

const oas = require('./__fixtures__/petstore/oas.json');
const oasCommon = require('./__fixtures__/parameters/common.json');

const createDocs = require('../lib/create-docs');

const docs = createDocs(oas, 'test-api-setting');

const languages = ['node', 'curl'];
const props = {
  appearance: {},
  docs,
  flags: {},
  glossaryTerms: [],
  oasFiles: {
    'test-api-setting': { ...oas, [extensions.SAMPLES_LANGUAGES]: languages },
  },
  oasUrls: {
    'test-api-setting': 'https://example.com/openapi.json',
  },
  suggestedEdits: false,
  variables: { user: {}, defaults: [] },
};

test('ApiExplorer renders a doc for each', () => {
  const explorer = shallow(<ApiExplorer {...props} />);

  expect(explorer.find('Doc')).toHaveLength(docs.length);
});

test('ApiExplorer should not render a common parameter OAS operation method', () => {
  const docsCommon = createDocs(oasCommon, 'test-api-setting');
  const propsCommon = {
    ...props,
    docs: docsCommon,
    oasFiles: {
      'test-api-setting': oasCommon,
    },
  };

  const explorer = shallow(<ApiExplorer {...propsCommon} />);

  // Doc should have neither `servers` or `parameters` from the spec because those aren't real HTTP methods.
  expect(explorer.find('Doc')).toHaveLength(docsCommon.length - 2);
});

describe('error handling', () => {
  const originalConsole = console;

  // We're testing errors here, so we don't need `console.error` logs spamming the test output.
  beforeEach(() => {
    // eslint-disable-next-line no-console
    console.error = () => {};
  });

  afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = originalConsole.error;
  });

  it('should display a masked error message if it fails to render', () => {
    const explorer = mount(<WrappedApiExplorer {...props} docs={[null, null]} maskErrorMessages={true} />);

    const html = explorer.html();

    expect(explorer.find(ErrorBoundary)).toHaveLength(1);
    expect(html).not.toMatch('support@readme.io');
    expect(html).toMatch('API Explorer');
  });

  it('should output a support-focused error message if it fails to render', () => {
    const explorer = mount(<WrappedApiExplorer {...props} docs={[null, null]} maskErrorMessages={false} />);

    const html = explorer.html();

    expect(explorer.find(ErrorBoundary)).toHaveLength(1);
    expect(html).toMatch('support@readme.io');
    expect(html).toMatch('API Explorer');
  });
});

describe('selected language', () => {
  it('should default to curl', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'test-api-setting': oas,
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
          'test-api-setting': oas,
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
        docs={[{ ...baseDoc, category: { apiSetting: 'test-api-setting' } }]}
        oasFiles={{
          'test-api-setting': oas,
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
        docs={[{ ...baseDoc, api: { method: 'get', apiSetting: { _id: 'test-api-setting' } } }]}
        oasFiles={{
          'test-api-setting': oas,
        }}
      />
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  it('should fetch it from `doc.api.apiSetting` if it is a string', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        docs={[{ ...baseDoc, api: { method: 'get', apiSetting: 'test-api-setting' } }]}
        oasFiles={{
          'test-api-setting': oas,
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
  const defaults = [];

  it('should read apiKey from `variables.user.apiKey`', () => {
    const apiKey = '123456';

    const explorer = shallow(<ApiExplorer {...props} variables={{ user: { apiKey }, defaults }} />);

    expect(explorer.state('auth')).toStrictEqual({ api_key: '123456', petstore_auth: '123456' });
  });

  it('should read apiKey from `variables.user.keys[].apiKey`', () => {
    const apiKey = '123456';

    const explorer = shallow(
      <ApiExplorer {...props} variables={{ user: { keys: [{ name: 'a', apiKey }] }, defaults }} />
    );

    expect(explorer.state('auth')).toStrictEqual({ api_key: '123456', petstore_auth: '123456' });
  });

  it('should read apiKey from `user_data.keys[].api_key`', () => {
    const apiKey = '123456';

    const explorer = shallow(
      <ApiExplorer {...props} variables={{ user: { keys: [{ name: 'project1', api_key: apiKey }] }, defaults }} />
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

  it('should be updated via editing AuthBox', () => {
    const explorer = mount(<ApiExplorer {...props} docs={docs.slice(0, 1)} />);
    const doc = explorer.find('Doc').at(0).instance();

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

  it('should be swapped via selecting through the AuthBox', () => {
    const apiKey = '123456';
    const apiKey2 = `${apiKey}-${apiKey}`;

    const explorer = mount(
      <ApiExplorer
        {...props}
        docs={docs.slice(0, 1)}
        variables={{
          user: {
            keys: [
              { id: apiKey, name: 'app 1', apiKey },
              { id: apiKey2, name: 'app 2', apiKey: apiKey2 },
            ],
          },
          defaults,
        }}
      />
    );

    const doc = explorer.find('Doc').at(0).instance();
    doc.setState({ showEndpoint: true, showAuthBox: true });

    explorer.update();

    expect(doc.props.groups).toStrictEqual([
      { id: apiKey, name: 'app 1' },
      { id: apiKey2, name: 'app 2' },
    ]);

    const box = explorer.find(AuthBox);

    const select = box.find('select');
    select.instance().value = apiKey2;
    select.simulate('change');

    expect(explorer.state('auth').petstore_auth).toBe(apiKey2);
  });

  it('should be swapped via selecting through the AuthBox if the user keys are missing an `id` property (but have `name`)', () => {
    const apiKey = '123456';
    const apiKey2 = `${apiKey}-${apiKey}`;

    const explorer = mount(
      <ApiExplorer
        {...props}
        docs={docs.slice(0, 1)}
        variables={{
          user: {
            keys: [
              { name: 'app 1', apiKey },
              { name: 'app 2', apiKey: apiKey2 },
            ],
          },
          defaults,
        }}
      />
    );

    const doc = explorer.find('Doc').at(0).instance();
    doc.setState({ showEndpoint: true, showAuthBox: true });

    explorer.update();

    expect(doc.props.groups).toStrictEqual([
      { id: 'app 1', name: 'app 1' },
      { id: 'app 2', name: 'app 2' },
    ]);

    const box = explorer.find(AuthBox);

    const select = box.find('select');
    select.instance().value = 'app 2';
    select.simulate('change');

    expect(explorer.state('auth').petstore_auth).toBe(apiKey2);
  });

  it('should merge securities auth changes', () => {
    const explorer = mount(<ApiExplorer {...props} />);

    explorer.instance().onAuthChange({ api_key: '7890' });
    explorer.instance().onAuthChange({ petstore_auth: '123456' });

    expect(explorer.state('auth')).toStrictEqual({ api_key: '7890', petstore_auth: '123456' });
  });
});
