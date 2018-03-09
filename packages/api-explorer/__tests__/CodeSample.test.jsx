const React = require('react');
const { shallow } = require('enzyme');
const extensions = require('@readme/oas-extensions');

const CodeSample = require('../src/CodeSample');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const props = {
  setLanguage: () => {},
  operation: new Operation({}, '/pet/{id}', 'get'),
  formData: {},
  language: 'node',
};

describe('tabs', () => {
  // TODO this doesnt work in readme
  test('should display tabs if there are examples in the oas file');

  test('should display tabs if SAMPLES_ENABLED is true', () => {
    const languages = ['node', 'curl'];
    const codeSample = shallow(
      <CodeSample
        {...props}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: languages,
            servers: [{ url: 'http://example.com' }],
          })
        }
      />,
    );

    expect(codeSample.find('ul.code-sample-tabs li').length).toBe(2);
    expect(codeSample.find('li').length).toBe(languages.length);
  });

  test('should display a message if no code samples', () => {
    const codeSample = shallow(
      <CodeSample
        {...props}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: false,
            [extensions.SAMPLES_LANGUAGES]: ['node'],
          })
        }
      />,
    );

    expect(codeSample.find('.hub-no-code').text()).toBe('No code samples available');
  });
});

describe('code examples', () => {
  test('should display custom examples over pre-filled examples', () => {
    const docProps = {
      setLanguage: () => {},
      operation: new Operation({}, '/pet/{id}', 'get'),
      formData: {},
      language: 'node',
      customCodeSamples: [
        {
          language: 'javascript',
          code: 'console.log(1);',
        },
      ],
    };
    const languages = ['node', 'curl'];
    const codeSample = shallow(
      <CodeSample
        {...docProps}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: languages,
            servers: [{ url: 'http://example.com' }],
          })
        }
      />,
    );

    expect(codeSample.find('.code-sample-body').length).toBe(1);
    expect(codeSample.find('pre.tomorrow-night.tabber-body').length).toBe(1);
  });
});

describe('code examples', () => {
  test('should display examples if SAMPLES_ENABLED is true', () => {
    const languages = ['node', 'curl'];
    const codeSample = shallow(
      <CodeSample
        {...props}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: languages,
            servers: [{ url: 'http://example.com' }],
          })
        }
      />,
    );

    expect(codeSample.find('.hub-code-auto').length).toBe(1);
    // We only render one language at a time
    expect(codeSample.find('.hub-code-auto pre').length).toBe(1);
    expect(codeSample.find('.hub-lang-switch-node').text()).toBe('Node');
  });
});

describe('updating language', () => {
  test('should call setLanguage', () => {
    const setLanguage = jest.fn();

    const codeSample = shallow(
      <CodeSample
        {...props}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['node'],
            servers: [{ url: 'http://example.com' }],
          })
        }
        setLanguage={setLanguage}
      />,
    );

    codeSample.find('.hub-lang-switch-node').simulate('click', { preventDefault: () => {} });
    expect(setLanguage.mock.calls[0]).toEqual(['node']);
  });
});
