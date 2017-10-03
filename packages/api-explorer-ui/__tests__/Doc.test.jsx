const React = require('react');
const { shallow, mount } = require('enzyme');
const Doc = require('../src/Doc');

const oas = require('./fixtures/petstore/oas');

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
};

function assertDocElements(component, doc) {
  expect(component.find(`#page-${doc.slug}`).length).toBe(1);
  expect(component.find('a.anchor-page-title').length).toBe(1);
  expect(component.find('h2').text()).toBe(doc.title);
}

test('should output a div', () => {
  const doc = shallow(<Doc {...props} />);

  assertDocElements(doc, props.doc);
  expect(doc.find('.hub-api').length).toBe(1);
  expect(doc.find('PathUrl').length).toBe(1);
  expect(doc.find('CodeSample').length).toBe(1);
  expect(doc.find('Params').length).toBe(1);
  expect(doc.find('Content').length).toBe(1);
});

test('should work without a doc.swagger/doc.path/oas', () => {
  const doc = { title: 'title', slug: 'slug', type: 'basic' };
  const docComponent = shallow(<Doc doc={doc} setLanguage={() => {}} />);

  assertDocElements(docComponent, doc);
  expect(docComponent.find('.hub-api').length).toBe(0);
  expect(docComponent.find('Content').length).toBe(1);
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
  test('should switch to true if auth is required and correct security is not passed', () => {
    // TODO use simulate instead of instance of example commented out:
    //   const props2 = {
    //     doc: {
    //       title: 'Title',
    //       slug: 'slug',
    //       type: 'endpoint',
    //       swagger: { path: '/api-key' },
    //       api: { method: 'post' },
    //       formData: { auth: { api_key: '' } },
    //       onSubmit: () => {},
    //     },
    //     oas2,
    //     setLanguage: () => {},
    //   };
    //   const doc = mount(<Doc {...props2} />);
    //   // doc.instance().onSubmit();
    //   doc.find('form').simulate('change', { path: '/api-key' });
    //   console.log(doc.find('form').html());
    //   doc.find('form').simulate('submit');
    //   expect(doc.state('showAuthBox')).toBe(true);
    // });
    const doc = mount(<Doc {...props} />);
    doc.instance().onSubmit();

    expect(doc.state('showAuthBox')).toBe(true);
    expect(doc.state('needsAuth')).toBe(true);
  });
});

describe('state.loading', () => {
  test('should default to false', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('loading')).toBe(false);
  });

  test('should switch to true on form submit', () => {
    const doc = shallow(<Doc {...props} />);
    doc.instance().onChange({ auth: { api_key: 'api-key' } });
    doc.instance().onSubmit();

    expect(doc.state('loading')).toBe(true);
  });
});
