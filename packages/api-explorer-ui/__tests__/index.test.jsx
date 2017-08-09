const React = require('react');
const { shallow } = require('enzyme');
const extensions = require('readme-oas-extensions');
const ApiExplorer = require('../src');

const oas = require('./fixtures/petstore/swagger');

const createDocs = require('../lib/create-docs');

const docs = createDocs(oas, 'api-setting');

test('ApiExplorer renders a doc for each', () => {
  const explorer = shallow(
    <ApiExplorer docs={docs} oasFiles={{ 'api-setting': oas }} />,
  );

  expect(explorer.find('Doc').length).toBe(docs.length);
});

describe('selected language', () => {
  test('should default to curl', () => {
    const explorer = shallow(
      <ApiExplorer docs={docs} oasFiles={{ 'api-setting': oas }} />,
    );

    expect(explorer.state('language')).toBe('curl');
  });

  test('should auto-select to the first language of the first oas file', () => {
    const languages = ['node', 'curl'];
    const explorer = shallow(
      <ApiExplorer
        docs={docs}
        oasFiles={{
          'api-setting': Object.assign({}, oas, {
            [extensions.SAMPLES_LANGUAGES]: languages,
          }),
        }}
      />,
    );

    expect(explorer.state('language')).toBe(languages[0]);
  });

  describe('#setLanguage()', () => {
    test('should update the language state', () => {
      const languages = ['node', 'curl'];
      const explorer = shallow(
        <ApiExplorer
          docs={docs}
          oasFiles={{
            'api-setting': Object.assign({}, oas, {
              [extensions.SAMPLES_LANGUAGES]: languages,
            }),
          }}
        />,
      );

      explorer.instance().setLanguage('language');
      expect(explorer.state('language')).toBe('language');
    });
  });
});
