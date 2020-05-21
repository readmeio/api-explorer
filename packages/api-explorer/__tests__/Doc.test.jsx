import { mountWithIntl } from 'enzyme-react-intl';
import { IntlProvider, FormattedMessage } from 'react-intl';
import {shallow} from 'enzyme'
import {Button} from 'antd'

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

test('should output correct components', (done) => {
  const wrapper = mountWithIntl(
    <IntlProvider>
      <Doc {...props} />
    </IntlProvider>
  );
  setTimeout(() => {
    wrapper.mount()
    assertDocElements(wrapper, props.doc);
    expect(wrapper.find(`div#page-${props.doc.slug}`).length).toBe(1);
    expect(wrapper.find('PathUrl').length).toBe(1);
    expect(wrapper.find('CodeSample').length).toBe(1);
    expect(wrapper.find('Params').length).toBe(1);
    expect(wrapper.find(ContentWithTitle)).toHaveLength(5);
    expect(wrapper.find(SchemaTabs)).toHaveLength(1)
    done()
  }, 0)
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

    const doc = shallow(<Doc {...props} />);

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

    const doc = shallow(<Doc {...props} {...props2} />);

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

    const doc = shallow(<Doc {...props} oas={proxyOas} />);

    const fetch = window.fetch;

    window.fetch = request => {
      expect(request.url).toContain(`${proxyOas.servers[0].url}`);
      return Promise.resolve(new Response());
    };

    doc.instance().onSubmit();

    window.fetch = fetch;
  });

  test('should call `tryItMetrics` on success', async () => {
    let called = false;

    const doc = shallow(
      <Doc
        {...props}
        tryItMetrics={() => {
            called = true;
          }}
        auth={{ api_key: 'api-key' }}
      />
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

describe('PathUrl', () => {
  it('should be passed auth from props if the one in state is undefined', () => {
    const doc = shallow(<Doc {...props} auth={{api_key: '123' }} />);
    const pathUrl = doc.find(PathUrl)
    expect(pathUrl.prop('auth')).toEqual({api_key: '123' })
  })
  it('should be passed auth from state if the one in state is not undefined', () => {
    const doc = shallow(<Doc {...props} auth={{api_key: '123' }} />);
    const pathUrl = doc.find(PathUrl)
    pathUrl.prop('onChange')({api_key: '456'})
    doc.update()
    expect(doc.find(PathUrl).prop('auth')).toEqual({api_key: '456' })
  })
})

describe('state.loading', () => {
  test('should default to false', () => {
    const doc = shallow(<Doc {...props} />);
    expect(doc.state('loading')).toBe(false);
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

  const doc = shallow(
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
  );
  expect(doc.find('ErrorBoundary').length).toBe(1);
});

describe('fallbackUrl', () => {
  it('should inject servers in oas if it has no server', () => {
    const fallback = 'https://somexample.com/';
    const clonedOas = Object.assign({}, oas);
    delete clonedOas.servers;

    const doc = shallow(
      <Doc
        {...props}
        oas={clonedOas}
        fallbackUrl={fallback}
      />
    )
    expect(doc.instance().oas.servers).toEqual([{url: fallback}])
  })
})

describe('stripSlash', () => {
  it('should default to false', () => {
    const doc = shallow(<div>{<Doc {...props} />}</div>).find(Doc)
    expect(doc.prop('stripSlash')).toBe(false)
  })

  it('should strip operation path', () => {
    const doc = shallow(
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
    )

    const operation = doc.instance().getOperation()
    expect(operation.path).toBe('/store/inventory')
  })

  it('should not strip operation path', () => {
    const doc = shallow(
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
    )

    const operation = doc.instance().getOperation()
    expect(operation.path).toBe('/store/inventory/')
  })
})

test('expand renderCodeAndResponse should be render correctly', () => {
  const element = mountWithIntl(<Doc {...props} />)
  const expandableElement = element.find('.expandable')
  expect(expandableElement.find(Button).find(FormattedMessage).prop('id')).toEqual('doc.expand')
  expect(expandableElement.find(Button).prop('icon')).toEqual('import')
  expect(expandableElement.prop('style')).toMatchSnapshot()
  element.find('.expandable').find(Button).simulate('click')

  const expandableElementAfter = element.find('.expandable')
  expect(expandableElementAfter.find(Button).find(Button).find(FormattedMessage).prop('id')).toEqual('doc.collapse')
  expect(expandableElementAfter.find(Button).find(Button).prop('icon')).toEqual('export')
  expect(expandableElementAfter.prop('style')).toMatchSnapshot()
})
