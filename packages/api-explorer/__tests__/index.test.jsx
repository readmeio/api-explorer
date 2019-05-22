import React from 'react';

const { shallow, mount } = require('enzyme');
const Cookie = require('js-cookie');
const extensions = require('@mia-platform/oas-extensions');
const WrappedApiExplorer = require('../src');

const { ApiExplorer } = WrappedApiExplorer;

const oas = require('./fixtures/petstore/oas');

const createDocs = require('../lib/create-docs');

const docs = createDocs(oas, 'api-setting');

const languages = ['node', 'curl'];
const expectedSampleLanguages = {'x-samples-languages': ['curl', 'node', 'javascript', 'java']}
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
    const expectedOas = {
      ...oas,
      ...expectedSampleLanguages
    }
    expect(explorer.find('Doc').props().oas).toEqual(expectedOas);
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
    const expectedOas = {
      ...oas,
      ...expectedSampleLanguages
    }
    expect(explorer.find('Doc').get(0).props.oas).toEqual(expectedOas);
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
    const expectedOas = {
      ...oas,
      ...expectedSampleLanguages
    }
    expect(explorer.find('Doc').get(0).props.oas).toEqual(expectedOas);
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

describe('showOnlyAPI', () => {
  it('should render description if property is not provided (default behaviour)', () => {
    const explorer = mount(<ApiExplorer {...props} />);
    expect(explorer.exists('div#oas-initial-description')).toBe(true);
  })

  it('should not render description if property is provided', () => {
    const explorer = mount(<ApiExplorer {...props} showOnlyAPI />);
    expect(explorer.exists('div#oas-initial-description')).toBe(false);
  })

  it('should render description if property is provided with false value', () => {
    const explorer = mount(<ApiExplorer {...props} showOnlyAPI={false} />);
    expect(explorer.exists('div#oas-initial-description')).toBe(true);
  })
})

describe('defaultOpen', () => {
  it('should pass defaultActiveKey a value (default behaviour)', () => {
    const explorer = mount(<ApiExplorer {...props} />);
    const collapse = explorer.find('Collapse')
    expect(collapse.at(1).prop('defaultActiveKey')).toEqual(['0']);
  })

  it('should pass null to defaultActiveKey a value if property is false', () => {
    const explorer = mount(<ApiExplorer {...props} defaultOpen={false} />);
    const collapse = explorer.find('Collapse')
    expect(collapse.at(1).prop('defaultActiveKey')).toEqual(null);
  })

  it('should pass a value to defaultActiveKey a value if property is true', () => {
    const explorer = mount(<ApiExplorer {...props} defaultOpen />);
    const collapse = explorer.find('Collapse')
    expect(collapse.at(1).prop('defaultActiveKey')).toEqual(['0']);
  })
})

describe('defaultOpenDoc', () => {
  it('should open panel 0 if none is provided (default behaviour)', () => {
    const explorer = mount(<ApiExplorer {...props} />);
    const collapse = explorer.find('Collapse')
    expect(collapse.at(1).state().activeKey).toEqual(['0']);
  })

  it('should open specified panel', () => {
    const explorer = mount(<ApiExplorer {...props} defaultOpenDoc="3" />);
    const collapse = explorer.find('Collapse')
    expect(collapse.at(1).state().activeKey).toEqual(['3']);
  })

  it('should open specified panel', () => {
    const explorer = mount(<ApiExplorer {...props} defaultOpenDoc="5" />);
    const collapse = explorer.find('Collapse')
    expect(collapse.at(1).state().activeKey).toEqual(['5']);
  })

  it('should not open if defaultOpen is false', () => {
    const explorer = mount(<ApiExplorer {...props} defaultOpen={false} defaultOpenDoc="1" />);
    const collapse = explorer.find('Collapse')
    expect(collapse.at(1).state().activeKey).toEqual([]);
  })
})

describe('onDocChange', () => {
  it('should be call if collapse#onChange is called', () => {
    const mock = jest.fn()
    const explorer = mount(<ApiExplorer {...props} onDocChange={mock} />);
    const collapse = explorer.find('Collapse').at(1)

    // Simulate click by calling antd property.
    collapse.props().onChange(4)

    expect(mock).toBeCalled()
    expect(mock).toBeCalledWith(4)
  })
})

describe('fallbackUrl', () => {
  const fallback = 'https://example.com'

  it('should default to empty string', () => {
    const explorer = mount(<ApiExplorer {...props} />);
    expect(explorer.prop('fallbackUrl')).toBe('')
  })

  it('should be provided to Doc children', () => {
    const baseDoc = {
      _id: 1,
      title: 'title',
      slug: 'slug',
      type: 'endpoint',
      category: {},
      api: { method: 'get' },
    };

    const explorer = mount(
      <ApiExplorer 
        {...props}
        fallbackUrl={fallback}
        docs={[Object.assign({}, baseDoc, {
          swagger: { path: '' },
          category: { apiSetting: 'api-setting' } 
        })]}
      />
    );
    const renderDocs = explorer.find('Doc')
    expect(renderDocs.prop('fallbackUrl')).toEqual(fallback)
  })
})

describe('CollapsePanel', () => {
  it('should only show URI path', () => {
    const explorer = mount(
      <ApiExplorer
        {...props}
        docs={[{
          _id: 1,
          title: 'title',
          slug: 'slug',
          type: 'endpoint',
          api: { method: 'get' },
          swagger: { path: '/some-path' },
          category: { apiSetting: 'api-setting' }
        }]}
      />
    );

    const panel = explorer.find('CollapsePanel div.ant-collapse-header b')
    expect(panel.text()).toEqual('/some-path')
  })
})

describe('stripSlash', () => {
  it('should default to true', () => {
    const explorer = mount(<ApiExplorer {...props} />)
    expect(explorer.prop('stripSlash')).toBe(true)
  })

  it('should be provided to Doc children', () => {
    const baseDoc = {
      _id: 1,
      title: 'title',
      slug: 'slug',
      type: 'endpoint',
      category: {},
      api: { method: 'get' },
    };

    const explorer = mount(
      <ApiExplorer 
        {...props}
        stripSlash={false}
        docs={[Object.assign({}, baseDoc, {
          swagger: { path: '' },
          category: { apiSetting: 'api-setting' } 
        })]}
      />
    );
    const renderDocs = explorer.find('Doc')
    expect(renderDocs.prop('stripSlash')).toEqual(false)
  })
})

describe('forcePanelRender', () => {
  it('should default to false', () => {
    const explorer = mount(<ApiExplorer {...props} />)
    expect(explorer.prop('forcePanelRender')).toBe(false)
  })

  it('should provide false to Ant.d Collapse.Panel components', () => {
    const baseDoc = {
      _id: 1,
      title: 'title',
      slug: 'slug',
      type: 'endpoint',
      category: {},
      api: { method: 'get' },
    };

    const explorer = mount(
      <ApiExplorer 
        {...props}
        forcePanelRender={false}
        docs={[Object.assign({}, baseDoc, {
          swagger: { path: '' },
          category: { apiSetting: 'api-setting' } 
        })]}
      />
    );
    
    explorer.find('CollapsePanel').map(panel => expect(panel.prop('forceRender')).toEqual(false))
  })

  it('should provide true to Ant.d Collapse.Panel components', () => {
    const baseDoc = {
      _id: 1,
      title: 'title',
      slug: 'slug',
      type: 'endpoint',
      category: {},
      api: { method: 'get' },
    };

    const explorer = mount(
      <ApiExplorer 
        {...props}
        forcePanelRender
        docs={[Object.assign({}, baseDoc, {
          swagger: { path: '' },
          category: { apiSetting: 'api-setting' } 
        })]}
      />
    );
    
    explorer.find('CollapsePanel').map(panel => expect(panel.prop('forceRender')).toEqual(true))
  })
})
