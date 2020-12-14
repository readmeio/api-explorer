const extensions = require('@readme/oas-extensions');
const { Request, Response } = require('node-fetch');

global.Request = Request;

const React = require('react');
const { shallow, mount } = require('enzyme');
const { waitFor } = require('@testing-library/react');
const Doc = require('../src/Doc');
const ErrorBoundary = require('../src/ErrorBoundary');

const petstore = require('@readme/oas-examples/3.0/json/petstore.json');
const uspto = require('@readme/oas-examples/3.0/json/uspto.json');
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
  lazy: false,
  oas: petstore,
  oauth: false,
  onAuthChange: () => {},
  onAuthGroupChange: () => {},
  setLanguage: () => {},
  suggestedEdits: false,
  tryItMetrics: () => {},
};

const petExample = {
  category: {
    id: 0,
    name: 'string',
  },
  name: 'doggie',
  photoUrls: ['string'],
  status: 'available',
  tags: [
    {
      id: 0,
      name: 'string',
    },
  ],
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
  // below that uses `jest.useFakeTimers()` fail ¯\_(ツ)_/¯. Skipping for now.
  // expect(doc.find('Params').length).toBe(1);
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
  manualProps.onAuthGroupChange = () => {};
  manualProps.setLanguage = () => {};
  manualProps.tryItMetrics = () => {};

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
      onAuthGroupChange={() => {}}
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
      onAuthGroupChange={() => {}}
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

    expect(doc.state('dirty')).toStrictEqual({ form: false, json: false });
  });

  it('should switch to true on form change', () => {
    const doc = shallow(<Doc {...props} />);
    doc.instance().onChange({ a: 1 });

    expect(doc.state('dirty')).toStrictEqual({ form: true, json: false });
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

describe('ResponseSchema', () => {
  it('should render ResponseSchema if endpoint does have a response', () => {
    const doc = shallow(<Doc {...props} oas={petstoreWithAuth} />);
    doc.setState({ showEndpoint: true });
    expect(doc.find('ResponseSchema')).toHaveLength(1);
  });

  it('should not render ResponseSchema if endpoint does not have a response', () => {
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
    const doc = shallow(<Doc {...props} Logs={() => {}} />);
    const res = doc.instance().renderLogs();
    expect(typeof res).toBe('object');
  });
});

describe('themes', () => {
  it('should output code samples and responses in the right column', () => {
    const doc = shallow(<Doc {...props} appearance={{ referenceLayout: 'column' }} />);
    doc.setState({ showEndpoint: true });

    expect(doc.find('.hub-reference-right').find('CodeSample')).toHaveLength(1);
    expect(doc.find('.hub-reference-right').find('Response')).toHaveLength(1);
  });
});

describe('error handling', () => {
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

  const docProps = {
    title: 'title',
    slug: 'slug',
    type: 'endpoint',
    swagger: { path: '/path' },
    api: { method: 'post' },
  };

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

  it('should output with a masked error message if the endpoint fails to load', () => {
    const doc = mount(<Doc {...props} doc={docProps} maskErrorMessages={true} oas={brokenOas} />);

    expect(doc.find(ErrorBoundary)).toHaveLength(1);

    const html = doc.html();
    expect(html).not.toMatch('support@readme.io');
    expect(html).toMatch("endpoint's documentation");
  });

  describe('support-focused error messaging', () => {
    it('should output with an error message if the endpoint fails to load, with a unique error event id', () => {
      const doc = mount(<Doc {...props} doc={docProps} maskErrorMessages={false} oas={brokenOas} />);

      doc.setState({ showEndpoint: true });

      const html = doc.html();

      expect(doc.find(ErrorBoundary)).toHaveLength(1);
      expect(html).toMatch('support@readme.io');
      expect(html).toMatch("endpoint's documentation");
    });
  });

  it('should call the onError handler', () => {
    const mockErrorHandler = jest.fn();

    const doc = mount(
      <Doc {...props} doc={docProps} maskErrorMessages={false} oas={brokenOas} onError={() => mockErrorHandler()} />
    );

    doc.setState({ showEndpoint: true });

    const html = doc.html();

    expect(mockErrorHandler).toHaveBeenCalled();
    expect(doc.find(ErrorBoundary)).toHaveLength(1);
    expect(html).toMatch('support@readme.io');
    expect(html).toMatch("endpoint's documentation");
    expect(html).toMatch(/ERR-([0-9A-Z]{6})/);
  });
});

describe('#enableRequestBodyJsonEditor', () => {
  it('should not show the editor on an operation without a request body', () => {
    const doc = shallow(<Doc {...props} enableRequestBodyJsonEditor={true} />);

    expect(doc.find('Tabs')).toHaveLength(0);
  });

  it('should not show the editor on an operation with a non-json request body', () => {
    const doc = mount(
      <Doc
        {...props}
        doc={{
          ...props.doc,
          api: { method: 'post' },
          swagger: { path: '/{dataset}/{version}/records' },
        }}
        enableRequestBodyJsonEditor={true}
        oas={uspto}
      />
    );

    expect(doc.find('Tabs')).toHaveLength(0);
  });

  it('should show the editor on an operation with a json-compatible request body', () => {
    const doc = mount(
      <Doc
        {...props}
        doc={{
          ...props.doc,
          api: { method: 'post' },
          swagger: { path: '/pet' },
        }}
        enableRequestBodyJsonEditor={true}
        oas={petstore}
      />
    );

    expect(doc.find('Tabs')).toHaveLength(1);
  });

  describe('#formDataJson', () => {
    it('should fill formDataJson with an example request body', () => {
      const doc = mount(
        <Doc
          {...props}
          doc={{
            ...props.doc,
            api: { method: 'post' },
            swagger: { path: '/pet' },
          }}
          enableRequestBodyJsonEditor={true}
          oas={petstore}
        />
      );

      return waitFor(() => {
        expect(doc.state('formDataJson')).toStrictEqual(petExample);
        expect(doc.state('formDataJsonOriginal')).toStrictEqual(doc.state('formDataJson'));
        expect(doc.state('formDataJsonRaw')).toMatch('"status": "available"');
      });
    });
  });
});

describe('#resetForm()', () => {
  it('should reset formDataJson', () => {
    const doc = mount(
      <Doc
        {...props}
        doc={{
          ...props.doc,
          api: { method: 'post' },
          swagger: { path: '/pet' },
        }}
        enableRequestBodyJsonEditor={true}
        oas={petstore}
      />
    );

    return waitFor(() => {
      expect(doc.state('formDataJson')).toStrictEqual(petExample);

      doc.setState({ formDataJson: { name: 'buster' } });

      doc.instance().resetForm();

      expect(doc.state('formDataJson')).toStrictEqual(petExample);
      expect(doc.state('formDataJsonRaw')).toMatch('"status": "available"');
      expect(doc.state('validationErrors')).toStrictEqual({ form: false, json: false });
      expect(doc.state('dirty')).toStrictEqual({ form: true, json: false });
    });
  });
});

describe('#onJsonChange()', () => {
  it('should update formDataJson when given valid json', () => {
    const doc = shallow(
      <Doc
        {...props}
        doc={{
          ...props.doc,
          api: { method: 'post' },
          swagger: { path: '/pet' },
        }}
        enableRequestBodyJsonEditor={true}
        oas={petstore}
      />
    );

    doc.instance().onJsonChange(JSON.stringify({ name: 'buster' }));

    expect(doc.state('formDataJson')).toStrictEqual({ name: 'buster' });
    expect(doc.state('formDataJsonRaw')).toStrictEqual(JSON.stringify({ name: 'buster' }));
    expect(doc.state('validationErrors')).toStrictEqual({ form: false, json: false });
    expect(doc.state('dirty')).toStrictEqual({ form: false, json: true });
  });

  it('should set validation errors when given invalid JSON', () => {
    const doc = shallow(
      <Doc
        {...props}
        doc={{
          ...props.doc,
          api: { method: 'post' },
          swagger: { path: '/pet' },
        }}
        enableRequestBodyJsonEditor={true}
        oas={petstore}
      />
    );

    doc.instance().onJsonChange(JSON.stringify({ name: 'buster' }));
    doc.instance().onJsonChange('{ invalid json }');

    expect(doc.state('formDataJson')).toStrictEqual({ name: 'buster' });
    expect(doc.state('formDataJsonRaw')).toStrictEqual('{ invalid json }');
    expect(doc.state('validationErrors')).toStrictEqual({
      form: false,
      json: expect.any(String),
    });

    expect(doc.state('dirty')).toStrictEqual({ form: false, json: true });
  });
});

describe('#onModeChange()', () => {
  it('should change the editing mode', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('editingMode')).toBe('form');

    doc.instance().onModeChange('JSON');
    expect(doc.state('editingMode')).toBe('json');
  });
});

describe('#isDirty()', () => {
  it('should return a dirty state based on the current editing mode', () => {
    const doc = shallow(<Doc {...props} />);

    doc.setState({ dirty: { form: true, json: false } });

    expect(doc.instance().isDirty()).toBe(true);

    doc.setState({ editingMode: 'json' });

    expect(doc.instance().isDirty()).toBe(false);
  });
});

describe('#getValidationErrors()', () => {
  it('should return validation errors based on the current editing mode', () => {
    const doc = shallow(<Doc {...props} />);

    doc.setState({ validationErrors: { form: false, json: 'invalid json' } });

    expect(doc.instance().getValidationErrors()).toBe(false);

    doc.setState({ editingMode: 'json' });

    expect(doc.instance().getValidationErrors()).toBe('invalid json');
  });
});

describe('#getFormDataForCurrentMode()', () => {
  it('should pull back the appropriate form data for the current editing mode', () => {
    const doc = shallow(<Doc {...props} />);

    doc.setState({
      formData: {
        headers: {
          'x-breed': 'pug',
        },
        body: {
          name: 'booster',
        },
      },
      formDataJson: {
        name: 'buster',
      },
    });

    expect(doc.instance().getFormDataForCurrentMode()).toStrictEqual({
      headers: { 'x-breed': 'pug' },
      body: { name: 'booster' },
    });

    doc.setState({ editingMode: 'json' });

    expect(doc.instance().getFormDataForCurrentMode()).toStrictEqual({
      headers: { 'x-breed': 'pug' },
      body: { name: 'buster' },
    });
  });
});
