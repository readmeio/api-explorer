const React = require('react');
const { shallow } = require('enzyme');
const Doc = require('../src/Doc');

const oas = require('./fixtures/petstore/oas');

const props = {
  doc: {
    title: 'Title',
    slug: 'slug',
    type: 'endpoint',
    swagger: { path: '/pet/{petId}' },
    api: { method: 'get' },
    formData: { auth: { api_key: 'hello' } },
  },
  oas,
  setLanguage: () => {},
};

test('should output a div', () => {
  const doc = shallow(<Doc {...props} />);

  expect(doc.find('.hub-reference').length).toBe(1);
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
  test('should switch to true if auth is required and correct security isn not passed', () => {
    const doc = shallow(<Doc {...props} />);
    doc.instance().onSubmit();

    expect(doc.state('showAuthBox')).toBe(true);
  });
});

describe('state.loading', () => {
  test('should default to false', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('loading')).toBe(false);
  });

  test.skip('should switch to true on form submit', () => {
    const doc = shallow(<Doc {...props} />);
    doc.instance().onSubmit({ a: 1 });

    expect(doc.state('loading')).toBe(true);
  });
});
