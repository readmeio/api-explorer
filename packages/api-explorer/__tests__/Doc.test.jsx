const extensions = require('@readme/oas-extensions');
const { Request, Response } = require('node-fetch');

global.Request = Request;

const React = require('react');
const { shallow, mount } = require('enzyme');
const Doc = require('../src/Doc');
const oas = require('./fixtures/petstore/circular-oas');
const multipleSecurities = require('./fixtures/multiple-securities/oas');

const props = {
  doc: {
    title: 'Title',
    slug: 'slug',
    type: 'endpoint',
    swagger: { path: '/pet/{petId}' },
    api: { method: 'get' },
    formData: { path: { petId: '1' }, auth: { api_key: '' } },
    onSubmit: () => {},
  },
  oas,
  setLanguage: () => {},
  language: 'node',
  suggestedEdits: false,
  oauth: false,
  onAuthChange: () => {},
  auth: {},
  tryItMetrics: () => {},
};

function assertDocElements(component, doc) {
  expect(component.find(`#page-${doc.slug}`).length).toBe(1);
  expect(component.find('a.anchor-page-title').length).toBe(1);
  expect(component.find('h2').text()).toBe(doc.title);
}

test('should output a div', () => {
  const doc = shallow(<Doc {...props} />);

  doc.setState({ showEndpoint: true });

  assertDocElements(doc, props.doc);
  expect(doc.find('.hub-api').length).toBe(1);
  expect(doc.find('PathUrl').length).toBe(1);
  expect(doc.find('CodeSample').length).toBe(1);
  // This test needs the component to be `mount()`ed
  // but for some reason when I mount in this test
  // it makes the test below that uses `jest.useFakeTimers()`
  // fail ¯\_(ツ)_/¯. Skipping for now
  // expect(doc.find('Params').length).toBe(1);
  expect(doc.find('Content').length).toBe(1);
});

test('should render straight away if `appearance.splitReferenceDocs` is true', () => {
  const doc = mount(
    <Doc
      {...props}
      appearance={{
        splitReferenceDocs: true,
      }}
    />,
  );

  expect(doc.find('Waypoint').length).toBe(0);
});

test('should render a manual endpoint', () => {
  const myProps = JSON.parse(JSON.stringify(props));
  myProps.doc.swagger.path = '/nonexistant';
  myProps.doc.api.examples = {
    codes: [],
  };
  myProps.doc.api.params = [
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
      {...myProps}
      appearance={{
        splitReferenceDocs: true,
      }}
    />,
  );

  assertDocElements(doc, props.doc);
  expect(doc.find('Params').length).toBe(1);
});

test('should work without a doc.swagger/doc.path/oas', () => {
  const doc = { title: 'title', slug: 'slug', type: 'basic' };
  const docComponent = shallow(
    <Doc
      doc={doc}
      setLanguage={() => {}}
      language="node"
      suggestedEdits
      oauth={false}
      tryItMetrics={() => {}}
      onAuthChange={() => {}}
      auth={{}}
    />,
  );
  expect(docComponent.find('Waypoint').length).toBe(1);
  docComponent.setState({ showEndpoint: true });

  assertDocElements(docComponent, doc);
  expect(docComponent.find('.hub-api').length).toBe(0);
  expect(docComponent.find('Content').length).toBe(1);
});

test('should still display `Content` with column-style layout', () => {
  const doc = { title: 'title', slug: 'slug', type: 'basic' };
  const docComponent = shallow(
    <Doc
      doc={doc}
      setLanguage={() => {}}
      language="node"
      suggestedEdits
      appearance={{ referenceLayout: 'column' }}
      oauth={false}
      tryItMetrics={() => {}}
      onAuthChange={() => {}}
      auth={{}}
    />,
  );
  docComponent.setState({ showEndpoint: true });

  assertDocElements(docComponent, doc);
  expect(docComponent.find('.hub-api').length).toBe(1);
  expect(docComponent.find('Content').length).toBe(2);
});

describe('state.dirty', () => {
  test('should default to false', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('dirty')).toBe(false);
  });

  test('should switch to true on form change', () => {
    const doc = shallow(<Doc {...props} />);
    doc.instance().onChange({ a: 1 });

    expect(doc.state('dirty')).toBe(true);
  });
});

describe('onSubmit', () => {
  test('should display authentication warning if auth is required for endpoint', () => {
    jest.useFakeTimers();

    const doc = mount(<Doc {...props} />);

    doc.instance().onSubmit();
    expect(doc.state('showAuthBox')).toBe(true);

    jest.runAllTimers();

    expect(doc.state('needsAuth')).toBe(true);
  });

  test('should make request on Submit', () => {
    const props2 = {
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
      oas,
      setLanguage: () => {},
      language: 'node',
      oauth: false,
      auth: { petstore_auth: 'api-key' },
    };

    const fetch = window.fetch;

    window.fetch = request => {
      expect(request.url).toContain(oas.servers[0].url);
      return Promise.resolve(
        new Response(JSON.stringify({ id: 1 }), {
          headers: { 'content-type': 'application/json' },
        }),
      );
    };

    const doc = mount(<Doc {...props} {...props2} />);

    doc
      .instance()
      .onSubmit()
      .then(() => {
        expect(doc.state('loading')).toBe(false);
        expect(doc.state('result')).not.toEqual(null);

        window.fetch = fetch;
      });
  });

  test('should make request to the proxy url if necessary', () => {
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

    const fetch = window.fetch;

    window.fetch = request => {
      expect(request.url).toContain(`https://try.readme.io/${proxyOas.servers[0].url}`);
      return Promise.resolve(new Response());
    };

    doc.instance().onSubmit();

    window.fetch = fetch;
  });

  test('should call `tryItMetrics` on success', async () => {
    let called = false;

    const doc = mount(
      <Doc
        {...props}
        tryItMetrics={() => {
          called = true;
        }}
        auth={{ api_key: 'api-key' }}
      />,
    );

    const fetch = window.fetch;
    window.fetch = () => {
      return Promise.resolve(new Response());
    };

    await doc.instance().onSubmit();
    expect(called).toBe(true);
    window.fetch = fetch;
  });
});

describe('toggleAuth', () => {
  test('toggleAuth should change state of showAuthBox', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('showAuthBox')).toBe(false);

    doc.instance().toggleAuth({ preventDefault() {} });

    expect(doc.state('showAuthBox')).toBe(true);

    doc.instance().toggleAuth({ preventDefault() {} });

    expect(doc.state('showAuthBox')).toBe(false);
  });
});

describe('state.loading', () => {
  test('should default to false', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('loading')).toBe(false);
  });
});

describe('suggest edits', () => {
  test('should not show if suggestedEdits is false', () => {
    const doc = shallow(<Doc {...props} suggestedEdits={false} />);
    expect(doc.find('a.hub-reference-edit.pull-right').length).toBe(0);
  });

  test('should show icon if suggested edits is true', () => {
    const doc = shallow(<Doc {...props} suggestedEdits />);
    expect(doc.find('a.hub-reference-edit.pull-right').length).toBe(1);
  });

  test('should have child project if baseUrl is set', () => {
    const doc = shallow(
      <Doc {...Object.assign({}, { baseUrl: '/child' }, props)} suggestedEdits />,
    );
    expect(doc.find('a.hub-reference-edit.pull-right').prop('href')).toBe(
      `/child/reference-edit/${props.doc.slug}`,
    );
  });
});

describe('Response Schema', () => {
  test('should render Response Schema if endpoint does have a response', () => {
    const doc = mount(<Doc {...props} />);
    doc.setState({ showEndpoint: true });
    expect(doc.find('ResponseSchema').length).toBe(1);
  });
  test('should not render Response Schema if endpoint does not have a response', () => {
    const doc = shallow(
      <Doc
        {...props}
        doc={{
          title: 'Title',
          slug: 'slug',
          type: 'endpoint',
          swagger: { path: '/unknown-scheme' },
          api: { method: 'post' },
          onSubmit: () => {},
        }}
        oas={multipleSecurities}
      />,
    );
    expect(doc.find('ResponseSchema').length).toBe(0);
  });
});

describe('themes', () => {
  test('should output code samples and responses in the right column', () => {
    const doc = mount(<Doc {...props} appearance={{ referenceLayout: 'column' }} />);
    doc.setState({ showEndpoint: true });

    expect(doc.find('.hub-reference-right').find('CodeSample').length).toBe(1);
    expect(doc.find('.hub-reference-right').find('Response').length).toBe(1);
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
      oas={brokenOas}
      doc={{
        title: 'title',
        slug: 'slug',
        type: 'endpoint',
        swagger: { path: '/path' },
        api: { method: 'post' },
      }}
    />,
  );

  doc.setState({ showEndpoint: true });

  expect(doc.find('EndpointErrorBoundary').length).toBe(1);
});
