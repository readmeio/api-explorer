const React = require('react');
const { shallow } = require('enzyme');
const extensions = require('readme-oas-extensions');

const CodeSample = require('../src/CodeSample');

const oas = require('./fixtures/petstore/oas');

const operation = oas.paths['/pet/{petId}'].get;

describe('tabs', () => {
  // TODO this doesnt work in readme
  test('it should display tabs if there are examples in the oas file');

  test('it should display tabs if SAMPLES_ENABLED is true', () => {
    const languages = ['node'];
    const codeSample = shallow(
      <CodeSample
        oas={{
          [extensions.SAMPLES_ENABLED]: true,
          [extensions.SAMPLES_LANGUAGES]: languages,
        }}
        operation={operation}
      />,
    );

    expect(codeSample.find('ul.code-sample-tabs').length).toBe(1);
    expect(codeSample.find('li').length).toBe(languages.length);
  });
});

describe.skip('selected language', () => {
  test('should default to the first language', () => {
    const languages = ['node'];
    const codeSample = shallow(
      <CodeSample
        oas={{
          [extensions.SAMPLES_ENABLED]: true,
          [extensions.SAMPLES_LANGUAGES]: languages,
        }}
        operation={operation}
      />,
    );

    expect(codeSample.state('language')).toBe('node');
  });
});
