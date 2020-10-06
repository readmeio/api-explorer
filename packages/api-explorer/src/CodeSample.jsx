const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const syntaxHighlighter = require('@readme/syntax-highlighter/dist/index.js').default;
const Oas = require('@readme/oas-tooling');
const generateCodeSnippet = require('@readme/oas-to-snippet');

const { Operation } = Oas;

const CopyCode = require('./CopyCode');

class CodeSample extends React.Component {
  constructor(props) {
    super(props);

    const { examples, language } = props;
    const selectedExample = examples.find(example => example.language === language);

    this.state = {
      selectedExample,
    };
  }

  getKey(example, index) {
    const key = `${example.language}-${index}`;
    let selected = this.state.selectedExample === example;
    if (!this.state.selectedExample && index === 0) {
      selected = true;
    }
    return { key, selected };
  }

  selectExample(example) {
    this.setState({ selectedExample: example });
  }

  renderSelected(examples, setLanguage) {
    const examplesWithLanguages = examples.filter(example => example.language);
    return (
      <div>
        <ul className="code-sample-tabs">
          {examplesWithLanguages.map((example, index) => {
            const { key, selected } = this.getKey(example, index);
            const selectedClass = selected ? 'selected' : '';
            return (
              <li key={key}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  className={selectedClass}
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setLanguage(example.language);
                    this.selectExample(example);
                  }}
                >
                  {example.name || generateCodeSnippet.getLangName(example.language)}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="code-sample-body">
          {examplesWithLanguages.map((example, index) => {
            const { key, selected } = this.getKey(example, index);
            return (
              <div key={key} style={{ display: selected ? 'block' : 'none' }}>
                <CopyCode key={`copy-${key}`} code={example.code} />
                <pre className="tomorrow-night tabber-body" style={{ display: selected ? 'block' : '' }}>
                  {syntaxHighlighter(example.code, example.language, { dark: true })}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    const { oas, oasUrl, setLanguage, operation, formData, language, examples, auth } = this.props;
    const samplesEnabled = extensions.getExtension(extensions.SAMPLES_ENABLED, oas, operation);

    // Operation-specific support for `x-samples-languages` is currently disabled until
    // https://github.com/readmeio/api-explorer/issues/965 is resolved.
    // const samplesLanguages = extensions.getExtension(extensions.SAMPLES_LANGUAGES, oas, operation);
    const samplesLanguages = extensions.getExtension(extensions.SAMPLES_LANGUAGES, oas, {});

    return (
      <div className="code-sample tabber-parent">
        {(() => {
          if (examples.length) return this.renderSelected(examples, setLanguage);
          if (!samplesEnabled) {
            return <div className="hub-no-code">No code samples available</div>;
          }

          let snippet;
          const { code, highlightMode } = generateCodeSnippet(oas, operation, formData, auth, language, oasUrl);
          if (code && highlightMode) {
            snippet = syntaxHighlighter(code, highlightMode, { dark: true });
          }

          return (
            <div>
              <ul className="code-sample-tabs">
                {samplesLanguages.map(lang => (
                  // TODO add `is-lang-${lang}` class, to body?
                  <li key={lang}>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a
                      className={`hub-lang-switch-${lang}`}
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setLanguage(lang);
                      }}
                    >
                      {generateCodeSnippet.getLangName(lang)}
                    </a>
                  </li>
                ))}
              </ul>

              {snippet ? (
                <div className="hub-code-auto">
                  <CopyCode code={code} />
                  <pre className={`tomorrow-night hub-lang hub-lang-${language}`}>{snippet}</pre>
                </div>
              ) : (
                // If we were unable to create a snippet or highlight one for any reason, instead of rendering an empty
                // box, show a friendly message instead.
                <div className="hub-no-code">No code sample available</div>
              )}
            </div>
          );
        })()}
      </div>
    );
  }
}

CodeSample.propTypes = {
  auth: PropTypes.shape({}).isRequired,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      language: PropTypes.string.isRequired,
    })
  ),
  formData: PropTypes.shape({}).isRequired,
  language: PropTypes.string.isRequired,
  oas: PropTypes.instanceOf(Oas).isRequired,
  oasUrl: PropTypes.string.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  setLanguage: PropTypes.func.isRequired,
};

CodeSample.defaultProps = {
  examples: [],
};

module.exports = CodeSample;
