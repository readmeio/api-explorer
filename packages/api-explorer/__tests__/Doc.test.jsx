const extensions = require('@readme/oas-extensions');
const { Request, Response } = require('node-fetch');

global.Request = Request;

const React = require('react');
const { shallow, mount } = require('enzyme');
const Doc = require('../src/Doc');

const petstore = require('@readme/oas-examples/3.0/json/petstore.json');
const petstoreWithAuth = require('./__fixtures__/petstore/oas.json');
const multipleSecurities = require('./__fixtures__/multiple-securities/oas.json');

const props = {
  auth: {},
  doc: {
    api: { method: 'get' },
    formData: { path: { petId: '1' }, auth: { api_key: '' } },
    slug: 'slug',
    swagger: { path: '/pet/{petId}' },
    title: 'Title',
    type: 'endpoint',
  },
  language: 'node',
  oas: petstore,
  oauth: false,
  onAuthChange: () => {},
  onGroupChange: () => {},
  setLanguage: () => {},
  suggestedEdits: false,
  tryItMetrics: () => {},
};

function assertDocElements(component, doc) {
  expect(component.find(`#page-${doc.slug}`)).toHaveLength(1);
  expect(component.find('a.anchor-page-title')).toHaveLength(1);
  expect(component.find('h2').text()).toBe(doc.title);
}

test('should output a div', () => {
  const doc = shallow(<Doc {...props} />);

  doc.setState({ showEndpoint: true });

  assertDocElements(doc, props.doc);
  expect(doc.find('.hub-api')).toHaveLength(1);
  expect(doc.find('PathUrl')).toHaveLength(1);
  expect(doc.find('CodeSample')).toHaveLength(1);

  // This test needs the component to be `mount()`ed but for some reason when I mount in this test it makes the test
  // below that uses `jest.useFakeTimers()` fail ¯\_(ツ)_/¯. Skipping for now expect(doc.find('Params').length).toBe(1);
  expect(doc.find('Content')).toHaveLength(1);
});

test('should render straight away if `appearance.splitReferenceDocs` is true', () => {
  const doc = mount(
    <Doc
      {...props}
      appearance={{
        splitReferenceDocs: true,
      }}
    />
  );

  expect(doc.find('Waypoint')).toHaveLength(0);
});

test('should render a manual endpoint', () => {
  // Transforming `props` like this is weird, but without it some auth timer tests will break. 🤷‍♂️
  const manualProps = JSON.parse(JSON.stringify(props));
  manualProps.onAuthChange = () => {};
  manualProps.onGroupChange = () => {};
  manualProps.setLanguage = () => {};
  manualProps.tryItMetrics = () => {};

  manualProps.doc.swagger.path = '/nonexistant';
  manualProps.doc.api.examples = {
    codes: [],
  };
  manualProps.doc.api.params = [
    {
      default: 'test',
      desc: 'test',
      in: 'path',
      name: 'test',
      ref: '',
      required: false,
      type: 'string',
    },
  ];

  const doc = mount(
    <Doc
      {...manualProps}
      appearance={{
        splitReferenceDocs: true,
      }}
    />
  );

  assertDocElements(doc, props.doc);
  expect(doc.find('Params')).toHaveLength(1);
});

test('should work without a doc.swagger/doc.path/oas', () => {
  const doc = { title: 'title', slug: 'slug', type: 'basic' };
  const docComponent = shallow(
    <Doc
      auth={{}}
      doc={doc}
      language="node"
      oauth={false}
      onAuthChange={() => {}}
      onGroupChange={() => {}}
      setLanguage={() => {}}
      suggestedEdits
      tryItMetrics={() => {}}
    />
  );
  expect(docComponent.find('Waypoint')).toHaveLength(1);
  docComponent.setState({ showEndpoint: true });

  assertDocElements(docComponent, doc);
  expect(docComponent.find('.hub-api')).toHaveLength(0);
  expect(docComponent.find('Content')).toHaveLength(1);
});

test('should still display `Content` with column-style layout', () => {
  const doc = { title: 'title', slug: 'slug', type: 'basic' };
  const docComponent = shallow(
    <Doc
      appearance={{ referenceLayout: 'column' }}
      auth={{}}
      doc={doc}
      language="node"
      oauth={false}
      onAuthChange={() => {}}
      onGroupChange={() => {}}
      setLanguage={() => {}}
      suggestedEdits
      tryItMetrics={() => {}}
    />
  );
  docComponent.setState({ showEndpoint: true });

  assertDocElements(docComponent, doc);
  expect(docComponent.find('.hub-api')).toHaveLength(1);
  expect(docComponent.find('Content')).toHaveLength(2);
});

describe('state.dirty', () => {
  it('should default to false', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('dirty')).toBe(false);
  });

  it('should switch to true on form change', () => {
    const doc = shallow(<Doc {...props} />);
    doc.instance().onChange({ a: 1 });

    expect(doc.state('dirty')).toBe(true);
  });
});

describe('onSubmit', () => {
  const { fetch } = window;

  afterEach(() => {
    window.fetch = fetch;
  });

  it('should display authentication warning if auth is required for endpoint', () => {
    jest.useFakeTimers();

    const doc = mount(<Doc {...props} oas={petstoreWithAuth} />);

    doc.instance().onSubmit();
    expect(doc.state('showAuthBox')).toBe(true);

    jest.runAllTimers();

    expect(doc.state('needsAuth')).toBe(true);
  });

  it('should make request on Submit', () => {
    expect.assertions(3);
    const props2 = {
      auth: { petstore_auth: 'api-key' },
      doc: {
        title: 'Title',
        slug: 'slug',
        type: 'endpoint',
        swagger: { path: '/pet' },
        api: { method: 'post' },
        formData: {
          body: {
            name: '1',
            photoUrls: ['1'],
          },
        },
        onSubmit: () => {},
      },
      language: 'node',
      oas: petstoreWithAuth,
      oauth: false,
      setLanguage: () => {},
    };

    window.fetch = request => {
      expect(request.url).toContain(petstoreWithAuth.servers[0].url);
      return Promise.resolve(
        new Response(JSON.stringify({ id: 1 }), {
          headers: { 'content-type': 'application/json' },
        })
      );
    };

    const doc = mount(<Doc {...props} {...props2} />);

    return doc
      .instance()
      .onSubmit()
      .then(() => {
        expect(doc.state('loading')).toBe(false);
        expect(doc.state('result')).not.toBeNull();
      });
  });

  it('should make request to the proxy url if necessary', () => {
    const proxyOas = {
      servers: [{ url: 'http://example.com' }],
      [extensions.PROXY_ENABLED]: true,
      paths: {
        '/pet/{petId}': {
          get: {
            responses: {
              default: {
                description: 'desc',
              },
            },
          },
        },
      },
    };

    const doc = mount(<Doc {...props} oas={proxyOas} />);

    window.fetch = request => {
      expect(request.url).toContain(`https://try.readme.io/${proxyOas.servers[0].url}`);
      return Promise.resolve(new Response());
    };

    doc.instance().onSubmit();
  });

  it('should call `tryItMetrics` on success', async () => {
    let called = false;

    const doc = mount(
      <Doc
        {...props}
        auth={{ api_key: 'api-key' }}
        tryItMetrics={() => {
          called = true;
        }}
      />
    );

    window.fetch = () => {
      return Promise.resolve(new Response());
    };

    await doc.instance().onSubmit();
    expect(called).toBe(true);
  });
});

describe('toggleAuth', () => {
  it('toggleAuth should change state of showAuthBox', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('showAuthBox')).toBe(false);

    doc.instance().toggleAuth({ preventDefault() {} });

    expect(doc.state('showAuthBox')).toBe(true);

    doc.instance().toggleAuth({ preventDefault() {} });

    expect(doc.state('showAuthBox')).toBe(false);
  });
});

describe('state.loading', () => {
  it('should default to false', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('loading')).toBe(false);
  });
});

describe('suggest edits', () => {
  it('should not show if suggestedEdits is false', () => {
    const doc = shallow(<Doc {...props} suggestedEdits={false} />);
    expect(doc.find('a.hub-reference-edit.pull-right')).toHaveLength(0);
  });

  it('should show icon if suggested edits is true', () => {
    const doc = shallow(<Doc {...props} suggestedEdits />);
    expect(doc.find('a.hub-reference-edit.pull-right')).toHaveLength(1);
  });

  it('should have child project if baseUrl is set', () => {
    const doc = shallow(<Doc {...{ baseUrl: '/child', ...props }} suggestedEdits />);
    expect(doc.find('a.hub-reference-edit.pull-right').prop('href')).toBe(`/child/reference-edit/${props.doc.slug}`);
  });
});

describe('Response Schema', () => {
  it('should render Response Schema if endpoint does have a response', () => {
    const doc = mount(<Doc {...props} oas={petstoreWithAuth} />);
    doc.setState({ showEndpoint: true });
    expect(doc.find('ResponseSchema')).toHaveLength(1);
  });

  it('should not render Response Schema if endpoint does not have a response', () => {
    const doc = shallow(
      <Doc
        {...props}
        doc={{
          title: 'Title',
          slug: 'slug',
          type: 'endpoint',
          swagger: { path: '/unknown-scheme' },
          api: { method: 'post' },
        }}
        oas={multipleSecurities}
      />
    );
    expect(doc.find('ResponseSchema')).toHaveLength(0);
  });
});

describe('RenderLogs', () => {
  it('should return a log component', () => {
    const doc = mount(<Doc {...props} />);
    doc.setProps({ Logs: () => {} });
    const res = doc.instance().renderLogs();
    expect(typeof res).toBe('object');
  });
});

describe('themes', () => {
  it('should output code samples and responses in the right column', () => {
    const doc = mount(<Doc {...props} appearance={{ referenceLayout: 'column' }} />);
    doc.setState({ showEndpoint: true });

    expect(doc.find('.hub-reference-right').find('CodeSample')).toHaveLength(1);
    expect(doc.find('.hub-reference-right').find('Response')).toHaveLength(1);
  });
});

test('should output with an error message if the endpoint fails to load', () => {
  const brokenOas = {
    paths: {
      '/path': {
        post: {
          requestBody: {
            $ref: '#/components/schemas/UnknownSchema',
          },
        },
      },
    },
  };

  const doc = mount(
    <Doc
      {...props}
      doc={{
        title: 'title',
        slug: 'slug',
        type: 'endpoint',
        swagger: { path: '/path' },
        api: { method: 'post' },
      }}
      oas={brokenOas}
    />
  );

  doc.setState({ showEndpoint: true });

  expect(doc.find('EndpointErrorBoundary')).toHaveLength(1);
});
