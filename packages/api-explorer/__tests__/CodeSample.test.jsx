const React = require('react');
const { shallow } = require('enzyme');
const extensions = require('@readme/oas-extensions');
const Oas = require('@readme/oas-tooling');
const petstore = require('@readme/oas-examples/3.0/json/petstore.json');

const CodeSample = require('../src/CodeSample');

const { Operation } = Oas;
const props = {
  auth: {},
  formData: {},
  language: 'node',
  setLanguage: () => {},
  oasUrl: 'https://example.com/openapi.json',
  operation: new Operation({}, '/pet/{id}', 'get'),
};

describe('tabs', () => {
  // TODO this doesnt work in readme
  it.todo('should display tabs if there are examples in the oas file');

  it('should display tabs if SAMPLES_ENABLED is true', () => {
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
      />
    );

    expect(codeSample.find('ul.code-sample-tabs li')).toHaveLength(2);
    expect(codeSample.find('li')).toHaveLength(languages.length);
  });

  it('should display a message if no code samples', () => {
    const codeSample = shallow(
      <CodeSample
        {...props}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: false,
            [extensions.SAMPLES_LANGUAGES]: ['node'],
          })
        }
      />
    );

    expect(codeSample.find('.hub-no-code').text()).toBe('No code samples available');
  });
});

describe('code examples', () => {
  it('should support the `node-simple` language', () => {
    const docProps = {
      ...props,
      language: 'node-simple',
      operation: new Operation({}, '/pets/{petId}', 'get'),
    };

    const codeSample = shallow(
      <CodeSample
        {...docProps}
        oas={
          new Oas({
            ...petstore,
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['node-simple'],
          })
        }
      />
    );

    expect(codeSample.find('.hub-code-auto pre').text()).toContain(
      "const sdk = require('api')('https://example.com/openapi.json');"
    );
  });

  it('should display custom examples over pre-filled examples', () => {
    const docProps = {
      ...props,
      operation: new Operation({}, '/pet/{id}', 'get'),
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
      />
    );

    expect(codeSample.find('.code-sample-body')).toHaveLength(1);
    expect(codeSample.find('pre.tomorrow-night.tabber-body')).toHaveLength(1);
  });

  it('should display custom examples even if SAMPLES_ENABLED is false', () => {
    const docProps = {
      ...props,
      operation: new Operation({}, '/pet/{id}', 'get'),
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
      />
    );

    expect(codeSample.find('.code-sample-body')).toHaveLength(1);
    expect(codeSample.find('pre.tomorrow-night.tabber-body')).toHaveLength(1);
  });

  it('should not error if no code given', () => {
    const docProps = {
      ...props,
      operation: new Operation({}, '/pet/{id}', 'get'),
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
        />
      )
    ).not.toThrow(/Cannot read property 'split' of undefined/);
  });

  it('should not error if language requested cannot be auto-generated', () => {
    const docProps = {
      ...props,
      operation: new Operation({}, '/pet/{id}', 'get'),
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
    expect(codeSample.find('.code-sample-tabs a')).toHaveLength(1);
    expect(codeSample.find('.hub-code-auto pre')).toHaveLength(0);
    expect(codeSample.find('.hub-no-code')).toHaveLength(1);
  });

  it('should not render sample if language is missing', () => {
    const docProps = {
      ...props,
      operation: new Operation({}, '/pet/{id}', 'get'),
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
      />
    );

    expect(codeSample.find('.code-sample-tabs a')).toHaveLength(1);
    expect(codeSample.find('.code-sample-body pre')).toHaveLength(1);
  });

  it('should render first of examples if language does not exist', () => {
    const docProps = {
      ...props,
      operation: new Operation({}, '/pet/{id}', 'get'),
      examples: [
        {
          language: 'javascript',
        },
        {
          language: 'typescript',
        },
      ],
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
      />
    );

    expect(codeSample.find('.code-sample-tabs a.selected').text()).toBe('JavaScript');
  });

  it('should display examples if SAMPLES_ENABLED is true', () => {
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
      />
    );

    expect(codeSample.find('.hub-code-auto')).toHaveLength(1);
    // We only render one language at a time
    expect(codeSample.find('.hub-code-auto pre')).toHaveLength(1);
    expect(codeSample.find('.hub-lang-switch-node').text()).toBe('Node');
  });

  // Skipped until https://github.com/readmeio/api-explorer/issues/965 is resolved.
  it.skip('should check the operation level extensions first', () => {
    const operationSamplesEnabled = new Operation({}, '/pet/{id}', 'get');
    operationSamplesEnabled[extensions.SAMPLES_ENABLED] = true;
    const languages = ['node', 'curl'];

    const codeSample = shallow(
      <CodeSample
        {...props}
        oas={
          new Oas({
            [extensions.SAMPLES_ENABLED]: false,
            [extensions.SAMPLES_LANGUAGES]: languages,
            servers: [{ url: 'http://example.com' }],
          })
        }
        operation={operationSamplesEnabled}
      />
    );

    expect(codeSample.find('.hub-code-auto')).toHaveLength(1);
    // We only render one language at a time
    expect(codeSample.find('.hub-code-auto pre')).toHaveLength(1);
    expect(codeSample.find('.hub-lang-switch-node').text()).toBe('Node');
  });

  it('should not display more than one example block at a time', () => {
    const docProps = {
      ...props,
      operation: new Operation({}, '/pet/{id}', 'get'),
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
      />
    );

    expect(codeSample.find('.code-sample-tabs a.selected')).toHaveLength(1);
  });
});

describe('updating language', () => {
  it('should call setLanguage', () => {
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
      />
    );

    codeSample.find('.hub-lang-switch-node').simulate('click', { preventDefault: () => {} });
    expect(setLanguage.mock.calls[0]).toMatchObject(['node']);
  });
});
