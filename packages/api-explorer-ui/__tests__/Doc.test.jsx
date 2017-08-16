const React = require('react');
const { shallow } = require('enzyme');
const Doc = require('../src/Doc');

const oas = require('./fixtures/petstore/oas');

test('should output a div', () => {
  const doc = shallow(
    <Doc
      doc={{
        title: 'Title',
        slug: 'slug',
        type: 'endpoint',
        swagger: { path: '/pet/{petId}' },
        api: { method: 'get' },
      }}
      oas={oas}
      setLanguage={() => {}}
    />,
  );

  expect(doc.find('.hub-reference').length).toBe(1);
});
