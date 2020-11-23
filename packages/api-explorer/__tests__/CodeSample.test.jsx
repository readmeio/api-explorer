const React = require('react');
const { shallow } = require('enzyme');
const extensions = require('@readme/oas-extensions');
const Oas = require('oas/tooling');
const petstore = require('@readme/oas-examples/3.0/json/petstore.json');

const CodeSample = require('../src/CodeSample');

const oas = new Oas(petstore);

const props = {
  auth: {},
  formData: {},
  language: 'node',
  setLanguage: () => {},
  oas,
  oasUrl: 'https://example.com/openapi.json',
  operation: oas.operation('/pet/{petId}', 'get'),
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
            ...petstore,
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: languages,
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
    const codeSample = shallow(
      <CodeSample
        {...props}
        language={'node-simple'}
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
    const codeSample = shallow(
      <CodeSample
        {...props}
        examples={[
          {
            language: 'javascript',
            code: 'console.log(1);',
          },
        ]}
        oas={
          new Oas({
            ...petstore,
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'],
          })
        }
      />
    );

    expect(codeSample.find('.code-sample-body')).toHaveLength(1);
    expect(codeSample.find('pre.tomorrow-night.tabber-body')).toHaveLength(1);
  });

  it('should display custom examples even if SAMPLES_ENABLED is false', () => {
    const codeSample = shallow(
      <CodeSample
        {...props}
        examples={[
          {
            language: 'javascript',
            code: 'console.log(1);',
          },
        ]}
        oas={
          new Oas({
            ...petstore,
            [extensions.SAMPLES_ENABLED]: false,
          })
        }
      />
    );

    expect(codeSample.find('.code-sample-body')).toHaveLength(1);
    expect(codeSample.find('pre.tomorrow-night.tabber-body')).toHaveLength(1);
  });

  it('should not error if no code given', () => {
    expect(() =>
      shallow(
        <CodeSample
          {...props}
          examples={[
            {
              language: 'javascript',
            },
          ]}
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
    const component = (
      <CodeSample
        {...props}
        language={'css'}
        oas={
          new Oas({
            ...petstore,
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['css'],
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
    const codeSample = shallow(
      <CodeSample
        {...props}
        examples={[
          {
            code: 'console.log(1);',
          },
          {
            language: 'curl',
            code: 'curl example.com',
          },
        ]}
        oas={
          new Oas({
            ...petstore,
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'],
          })
        }
      />
    );

    expect(codeSample.find('.code-sample-tabs a')).toHaveLength(1);
    expect(codeSample.find('.code-sample-body pre')).toHaveLength(1);
  });

  it('should render first of examples if language does not exist', () => {
    const codeSample = shallow(
      <CodeSample
        {...props}
        examples={[
          {
            language: 'javascript',
          },
          {
            language: 'typescript',
          },
        ]}
        language={'perl'}
        oas={
          new Oas({
            ...petstore,
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['css'],
          })
        }
      />
    );

    expect(codeSample.find('.code-sample-tabs a.selected').text()).toBe('JavaScript');
  });

  it('should display examples if SAMPLES_ENABLED is true', () => {
    const codeSample = shallow(
      <CodeSample
        {...props}
        oas={
          new Oas({
            ...petstore,
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'],
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
    const operationSamplesEnabled = oas.operation('/pet/{petId}', 'get');
    operationSamplesEnabled.schema[extensions.SAMPLES_ENABLED] = true;

    const codeSample = shallow(
      <CodeSample
        {...props}
        oas={
          new Oas({
            ...petstore,
            [extensions.SAMPLES_ENABLED]: false,
            [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'],
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
    const codeSample = shallow(
      <CodeSample
        {...props}
        examples={[
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
        ]}
        language={'javascript'}
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
            ...petstore,
            [extensions.SAMPLES_ENABLED]: true,
            [extensions.SAMPLES_LANGUAGES]: ['node'],
          })
        }
        setLanguage={setLanguage}
      />
    );

    codeSample.find('.hub-lang-switch-node').simulate('click', { preventDefault: () => {} });
    expect(setLanguage.mock.calls[0]).toMatchObject(['node']);
  });
});
