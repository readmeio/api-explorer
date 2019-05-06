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

test.skip('ApiExplorer renders a single doc', () => {
  const explorer = shallow(<ApiExplorer {...props} />);
  expect(explorer.find('Doc').length).toBe(1);
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
    const explorer = mount(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
        docs={[Object.assign({}, baseDoc, {
          swagger: { path: '' },
          category: { apiSetting: 'api-setting' } 
        })]}
      />,
    );

    expect(explorer.find('Doc').props().oas).toBe(oas);
  });

  // Some other legacy APIs where Endpoints are created in arbitrary categories
  it('should fetch it from `doc.api.apiSetting._id`', () => {
    const explorer = mount(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
        docs={[
          Object.assign({}, baseDoc, {
            api: { method: 'get', apiSetting: { _id: 'api-setting' } },
            swagger: { path: '' }, 
          }),
        ]}
      />,
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  it('should fetch it from `doc.api.apiSetting` if it is a string', () => {
    const explorer = mount(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
        docs={[
          Object.assign({}, baseDoc, {
            swagger: { path: '' }, 
            api: { method: 'get', apiSetting: 'api-setting' },
          }),
        ]}
      />,
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  // Of course... `typeof null === 'object'`
  it('should not error if `doc.api.apiSetting` is null', () => {
    const explorer = mount(
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
    const explorer = mount(<ApiExplorer {...props} docs={[baseDoc]} />);

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

  it('should default to empty string', () => {
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('auth')).toEqual({ api_key: '', petstore_auth: '' });
  });

  test('should merge securities auth changes', () => {
    const explorer = mount(<ApiExplorer {...props} />);

    explorer.instance().onAuthChange({ api_key: '7890' });
    explorer.instance().onAuthChange({ petstore_auth: '123456' });

    expect(explorer.state('auth')).toEqual({ api_key: '7890', petstore_auth: '123456' });
  });
});
