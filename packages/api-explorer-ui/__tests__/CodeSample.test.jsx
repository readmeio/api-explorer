const React = require('react');
const { shallow } = require('enzyme');
const extensions = require('readme-oas-extensions');

const CodeSample = require('../src/CodeSample');

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
          servers: [
            { url: 'http://example.com' },
          ],
        }}
        setLanguage={() => {}}
        path="/pet/{id}"
        method="get"
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
        setLanguage={() => {}}
        path="/pet/{id}"
        method="get"
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
          servers: [
            { url: 'http://example.com' },
          ],
        }}
        setLanguage={() => {}}
        path="/pet/{id}"
        method="get"
      />,
    );

    expect(codeSample.find('.hub-code-auto').length).toBe(1);
    expect(codeSample.find('.hub-code-auto pre').length).toBe(languages.length);
  });
});

describe('updating language', () => {
  test('should call setLanguage', () => {
    const setLanguage = jest.fn();

    const codeSample = shallow(
      <CodeSample
        oas={{
          [extensions.SAMPLES_ENABLED]: true,
          [extensions.SAMPLES_LANGUAGES]: ['node'],
          servers: [
            { url: 'http://example.com' },
          ],
        }}
        setLanguage={setLanguage}
        path="/pet/{id}"
        method="get"
      />,
    );

    codeSample.find('.hub-lang-switch-node').simulate('click', { preventDefault: () => {} });
    expect(setLanguage.mock.calls[0]).toEqual(['node']);
  });
});
