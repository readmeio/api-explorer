const React = require('react');
const { shallow } = require('enzyme');
const extensions = require('@readme/oas-extensions');

const CodeSample = require('../src/CodeSample');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const props = {
  formData: {},
  language: 'node',
  setLanguage: () => {},
  operation: new Operation({}, '/pet/{id}', 'get'),
};

describe('tabs', () => {
  // TODO this doesnt work in readme
  test.skip('should display tabs if there are examples in the oas file', () => {});

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
      examples: [
        {
          language: 'javascript',
          code: 'console.log(1);',
        },
      ],
    };
    const codeSample = shallow(
      <CodeSample
        {...docProps}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'],
            servers: [{ url: 'http://example.com' }],
          })
        }
      />,
    );

    expect(codeSample.find('.code-sample-body').length).toBe(1);
    expect(codeSample.find('pre.tomorrow-night.tabber-body').length).toBe(1);
  });

  test('should display custom examples even if SAMPLES_ENABLED is false', () => {
    const docProps = {
      setLanguage: () => {},
      operation: new Operation({}, '/pet/{id}', 'get'),
      language: 'node',
      examples: [
        {
          language: 'javascript',
          code: 'console.log(1);',
        },
      ],
    };
    const codeSample = shallow(
      <CodeSample
        {...docProps}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: false,
            servers: [{ url: 'http://example.com' }],
          })
        }
      />,
    );

    expect(codeSample.find('.code-sample-body').length).toBe(1);
    expect(codeSample.find('pre.tomorrow-night.tabber-body').length).toBe(1);
  });

  test('should not error if no code given', () => {
    const docProps = {
      setLanguage: () => {},
      operation: new Operation({}, '/pet/{id}', 'get'),
      formData: {},
      language: 'node',
      examples: [
        {
          language: 'javascript',
        },
      ],
    };
    expect(() =>
      shallow(
        <CodeSample
          {...docProps}
          oas={
            new Oas({
              [extensions.SAMPLES_ENABLED]: true,
              [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'],
              servers: [{ url: 'http://example.com' }],
            })
          }
        />,
      ),
    ).not.toThrow(/Cannot read property 'split' of undefined/);
  });

  test('should not error if language requested cannot be auto-generated', () => {
    const docProps = {
      setLanguage: () => {},
      operation: new Operation({}, '/pet/{id}', 'get'),
      formData: {},
      language: 'css',
    };
    const component = (
      <CodeSample
        {...docProps}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['css'],
            servers: [{ url: 'http://example.com' }],
          })
        }
      />
    );
    expect(() => shallow(component)).not.toThrow(/Cannot read property 'snippet' of undefined/);

    const codeSample = shallow(component);
    expect(codeSample.find('.code-sample-tabs a').length).toBe(1);
    expect(codeSample.find('.hub-code-auto pre').length).toBe(0);
  });

  test('should not render sample if language is missing', () => {
    const docProps = {
      setLanguage: () => {},
      operation: new Operation({}, '/pet/{id}', 'get'),
      formData: {},
      language: 'node',
      examples: [
        {
          code: 'console.log(1);',
        },
        {
          language: 'curl',
          code: 'curl example.com',
        },
      ],
    };

    const codeSample = shallow(
      <CodeSample
        {...docProps}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'],
            servers: [{ url: 'http://example.com' }],
          })
        }
      />,
    );

    expect(codeSample.find('.code-sample-tabs a').length).toBe(1);
    expect(codeSample.find('.code-sample-body pre').length).toBe(1);
  });

  test('should render first of examples if language does not exist', () => {
    const docProps = {
      setLanguage: () => {},
      operation: new Operation({}, '/pet/{id}', 'get'),
      examples: [
        {
          language: 'javascript',
        },
        {
          language: 'typescript',
        },
      ],
      formData: {},
      language: 'perl',
    };

    const codeSample = shallow(
      <CodeSample
        {...docProps}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['css'],
            servers: [{ url: 'http://example.com' }],
          })
        }
      />,
    );
    expect(codeSample.find('.code-sample-tabs a.selected').text()).toBe('JavaScript');
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

  test('should not display more than one example block at a time', () => {
    const docProps = {
      setLanguage: () => {},
      operation: new Operation({}, '/pet/{id}', 'get'),
      formData: {},
      language: 'javascript',
      examples: [
        {
          name: 'Javascript/Node.js',
          code: 'console.log(1);',
          language: 'javascript',
        },
        {
          name: 'TypeScript',
          code: 'console.log(1)',
          language: 'javascript',
        },
      ],
    };

    const codeSample = shallow(
      <CodeSample
        {...docProps}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'],
            servers: [{ url: 'http://example.com' }],
          })
        }
      />,
    );

    expect(codeSample.find('.code-sample-tabs a.selected').length).toBe(1);
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
