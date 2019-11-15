import { mountWithIntl } from 'enzyme-react-intl';
import { IntlProvider } from 'react-intl';

import ContentWithTitle from '../src/components/ContentWithTitle'
import SchemaTabs from '../src/components/SchemaTabs'
import PathUrl from '../src/PathUrl'

const extensions = require('@mia-platform/oas-extensions');
const { Request, Response } = require('node-fetch');

global.Request = Request;

const React = require('react');

const Doc = require('../src/Doc');
const oas = require('./fixtures/petstore/circular-oas');
const oasWithSlashes = require('./fixtures/petstore/oas')

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
  auth: {},
  tryItMetrics: () => {},
};

function assertDocElements(component, doc) {
  expect(component.find(`#page-${doc.slug}`).length).toBe(1);
}

test('should output correct components', () => {
  const wrapper = mountWithIntl(
    <IntlProvider>
      <Doc {...props} />
    </IntlProvider>
  );

  assertDocElements(wrapper, props.doc);
  expect(wrapper.find(`div#page-${props.doc.slug}`).length).toBe(1);
  expect(wrapper.find('PathUrl').length).toBe(1);
  expect(wrapper.find('CodeSample').length).toBe(1);
  // This test needs the component to be `mount()`ed
  // but for some reason when I mount in this test
  // it makes the test below that uses `jest.useFakeTimers()`
  // fail ¯\_(ツ)_/¯. Skipping for now
  expect(wrapper.find('Params').length).toBe(1);
  expect(wrapper.find(ContentWithTitle)).toHaveLength(5);
  expect(wrapper.find(SchemaTabs)).toHaveLength(1)
});

test('should render straight away if `appearance.splitReferenceDocs` is true', () => {
  const doc = mountWithIntl(
    <IntlProvider>
      <Doc
        {...props}
        appearance={{
          splitReferenceDocs: true,
        }}
      />
    </IntlProvider>
  );

  expect(doc.find('Waypoint').length).toBe(0);
});

test('should work without a doc.swagger/doc.path/oas', () => {
  const doc = { title: 'title', slug: 'slug', type: 'basic' };
  const docComponent = mountWithIntl(
    <IntlProvider>
      <Doc
        doc={doc}
        setLanguage={() => {}}
        language="node"
        suggestedEdits
        oauth={false}
        tryItMetrics={() => {}}
        onAuthChange={() => {}}
        auth={{}}
      />
    </IntlProvider>
  );

  assertDocElements(docComponent, doc);
  expect(docComponent.find(`div#page-${props.doc.slug}`).length).toBe(1);
  expect(docComponent.find('ContentWithTitle').length).toBe(0);
});

test('should still display `Content` with column-style layout', () => {
  const doc = { title: 'title', slug: 'slug', type: 'basic' };
  const docComponent = mountWithIntl(
    <IntlProvider>
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
      />
    </IntlProvider>
  );

  assertDocElements(docComponent, doc);
  expect(docComponent.find('ContentWithTitle').length).toBe(0);
});

describe('state.dirty', () => {
  test('should default to false', () => {
    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} /></IntlProvider>);
    const doc = wrapper.find('Doc')

    expect(doc.state('dirty')).toBe(false);
  });

  test('should switch to true on form change', () => {
    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} /></IntlProvider>);
    const doc = wrapper.find('Doc')
    doc.instance().onChange({ a: 1 });

    expect(doc.state('dirty')).toBe(true);
  });
});

describe('onSubmit', () => {
  test('should display authentication warning if auth is required for endpoint', () => {
    jest.useFakeTimers();

    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} /></IntlProvider>);
    const doc = wrapper.find('Doc')

    // mock authInput focus function.
    doc.instance().authInput = {focus: () => {}}
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

    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} {...props2} /></IntlProvider>);
    const doc = wrapper.find('Doc')

    doc
      .instance()
      .onSubmit()
      .then(() => {
        expect(doc.state('loading')).toBe(false);
        expect(doc.state('result')).not.toEqual(null);

        window.fetch = fetch;
      });
  });

  test('should not make request to the proxy url if necessary (proxy feature has been removed)', () => {
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

    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} oas={proxyOas} /></IntlProvider>);

    const fetch = window.fetch;

    window.fetch = request => {
      expect(request.url).toContain(`${proxyOas.servers[0].url}`);
      return Promise.resolve(new Response());
    };

    const doc = wrapper.find('Doc')
    doc.instance().onSubmit();

    window.fetch = fetch;
  });

  test('should call `tryItMetrics` on success', async () => {
    let called = false;

    const wrapper = mountWithIntl(
      <IntlProvider>
        <Doc
          {...props}
          tryItMetrics={() => {
            called = true;
          }}
          auth={{ api_key: 'api-key' }}
        />
      </IntlProvider>
    );

    const fetch = window.fetch;
    window.fetch = () => {
      return Promise.resolve(new Response());
    };

    const doc = wrapper.find('Doc')
    await doc.instance().onSubmit();
    expect(called).toBe(true);
    window.fetch = fetch;
  });
});

describe('toggleAuth', () => {
  test('toggleAuth should change state of showAuthBox', () => {
    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} /></IntlProvider>);
    const doc = wrapper.find('Doc')

    expect(doc.state('showAuthBox')).toBe(false);

    doc.instance().toggleAuth({ preventDefault() {} });

    expect(doc.state('showAuthBox')).toBe(true);

    doc.instance().toggleAuth({ preventDefault() {} });

    expect(doc.state('showAuthBox')).toBe(false);
  });
});

describe('PathUrl', () => {
  it('should be passed auth from props if the one in state is undefined', () => {
    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} auth={{api_key: '123' }} /></IntlProvider>);
    wrapper.mount()
    const pathUrl = wrapper.find(PathUrl)
    expect(pathUrl.prop('auth')).toEqual({api_key: '123' })
  })
  it('should be passed auth from state if the one in state is not undefined', () => {
    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} auth={{api_key: '123' }} /></IntlProvider>);
    wrapper.mount()
    const pathUrl = wrapper.find(PathUrl)
    pathUrl.prop('onChange')({api_key: '456'})
    wrapper.mount()
    expect(wrapper.find(PathUrl).prop('auth')).toEqual({api_key: '456' })
  })
})

describe('state.loading', () => {
  test('should default to false', () => {
    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} /></IntlProvider>);
    const doc = wrapper.find('Doc')

    expect(doc.state('loading')).toBe(false);
  });
});

describe('suggest edits', () => {
  test('should not show if suggestedEdits is false', () => {
    const wrapper = mountWithIntl(<IntlProvider><Doc {...props} suggestedEdits={false} /></IntlProvider>)
    expect(wrapper.find(`a[href="//reference-edit/${props.doc.slug}"]`).length).toBe(0);
  });

  test('should show icon if suggested edits is true', () => {
    const wrapper = mountWithIntl(
      <IntlProvider>
        <Doc {...props} suggestedEdits />
      </IntlProvider>
    );
    expect(wrapper.find(`a[href="//reference-edit/${props.doc.slug}"]`).length).toBe(1);
  });

  test('should have child project if baseUrl is set', () => {
    const wrapper = mountWithIntl(
      <IntlProvider>
        <Doc {...Object.assign({}, { baseUrl: '/child' }, props)} suggestedEdits />
      </IntlProvider>
    );
    expect(wrapper.find(`a[href="/child/reference-edit/${props.doc.slug}"]`).length).toBe(1);
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

  const wrapper = mountWithIntl(
    <IntlProvider>
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
      />
    </IntlProvider>
  );
  const doc = wrapper.find('Doc')
  expect(doc.find('ErrorBoundary').length).toBe(1);
});

describe('fallbackUrl', () => {
  it('should default to empty string', () => {
    const doc = mountWithIntl(
      <IntlProvider>
        <Doc {...props} />
      </IntlProvider>
    ).find('Doc');
    expect(doc.prop('fallbackUrl')).toBe('')
  })

  it('should inject servers in oas if it has no server', () => {
    const fallback = 'https://somexample.com/';
    const clonedOas = Object.assign({}, oas);
    delete clonedOas.servers;

    const doc = mountWithIntl(
      <IntlProvider>
        <Doc
          {...props}
          oas={clonedOas}
          fallbackUrl={fallback}
        />
      </IntlProvider>
    ).find('Doc');
    expect(doc.instance().oas.servers).toEqual([{url: fallback}])
  })
})

describe('stripSlash', () => {
  it('should default to false', () => {
    const doc = mountWithIntl(
      <IntlProvider>
        <Doc {...props} />
      </IntlProvider>
    ).find('Doc');
    expect(doc.prop('stripSlash')).toBe(false)
  })

  it('should strip operation path', () => {
    const doc = mountWithIntl(
      <IntlProvider>
        <Doc
          {...props}
          stripSlash
          doc={{
            title: 'Title',
            slug: 'slug',
            type: 'endpoint',
            swagger: { path: '/store/inventory/' },
            api: { method: 'get' },
            formData: { path: { petId: '1' }, auth: { api_key: '' } },
            onSubmit: () => {},
          }}
          oas={oasWithSlashes}
        />
      </IntlProvider>
    ).find('Doc');

    const operation = doc.instance().getOperation()
    expect(operation.path).toBe('/store/inventory')
  })

  it('should not strip operation path', () => {
    const doc = mountWithIntl(
      <IntlProvider>
        <Doc
          {...props}
          doc={{
            title: 'Title',
            slug: 'slug',
            type: 'endpoint',
            swagger: { path: '/store/inventory/' },
            api: { method: 'get' },
            formData: { path: { petId: '1' }, auth: { api_key: '' } },
            onSubmit: () => {},
          }}
          oas={oasWithSlashes}
          stripSlash={false}
        />
      </IntlProvider>
    ).find('Doc');

    const operation = doc.instance().getOperation()
    expect(operation.path).toBe('/store/inventory/')
  })
})
