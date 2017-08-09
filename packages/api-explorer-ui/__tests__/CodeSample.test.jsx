const React = require('react');
const { shallow } = require('enzyme');
const extensions = require('readme-oas-extensions');

const CodeSample = require('../src/CodeSample');

const oas = require('./fixtures/petstore/oas');

const operation = oas.paths['/pet/{petId}'].get;

describe('tabs', () => {
  // TODO this doesnt work in readme
  test('should display tabs if there are examples in the oas file');

  test('should display tabs if SAMPLES_ENABLED is true', () => {
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

  test('should display a message if no code samples', () => {
    const codeSample = shallow(
      <CodeSample
        oas={{
          [extensions.SAMPLES_ENABLED]: false,
          [extensions.SAMPLES_LANGUAGES]: ['node'],
        }}
        operation={operation}
      />,
    );

    expect(codeSample.find('.hub-no-code').text()).toBe('No code samples available');
  });
});

describe('code examples', () => {
  test('should display examples if SAMPLES_ENABLED is true', () => {
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

    expect(codeSample.find('.hub-code-auto').length).toBe(1);
    expect(codeSample.find('pre').length).toBe(languages.length);
  });
});

describe('selected language', () => {
  test('should default to the first language', () => {
    const languages = ['node', 'curl'];
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
