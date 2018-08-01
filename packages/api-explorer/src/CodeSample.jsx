const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const Oas = require('./lib/Oas');

const { Operation } = Oas;

const syntaxHighlighter = require('@readme/syntax-highlighter');

const generateCodeSnippet = require('./lib/generate-code-snippet');

class CodeSample extends React.Component {
  renderExamples(examples, setLanguage) {
    const examplesWithLanguages = examples.filter(example => example.language);
    return (
      <div>
        <ul className="code-sample-tabs">
          {examplesWithLanguages.map(example => (
            <li key={example.language}>
              {
                // eslint-disable-next-line jsx-a11y/href-no-hash
                <a
                  href="#"
                  className={`hub-lang-switch-${example.language}`}
                  onClick={e => {
                    e.preventDefault();
                    setLanguage(example.language);
                  }}
                >
                  {example.name || generateCodeSnippet.getLangName(example.language)}
                </a>
              }
            </li>
          ))}
        </ul>
        <div className="code-sample-body">
          {examplesWithLanguages.map(example => {
            return (
              <pre
                className="tomorrow-night tabber-body"
                style={{ display: this.props.language === example.language ? 'block' : '' }}
                key={example.language}
              >{syntaxHighlighter(example.code || '', example.language, { dark: true })}</pre>
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    const { oas, setLanguage, operation, formData, language, examples } = this.props;

    return (
      <div className="code-sample tabber-parent">
        {(() => {
          if (!oas[extensions.SAMPLES_ENABLED]) {
            return <div className="hub-no-code">No code samples available</div>;
          }
          if (examples.length) return this.renderExamples(examples, setLanguage);
          const snippet = generateCodeSnippet(oas, operation, formData, language);
          return (
            <div>
              <ul className="code-sample-tabs">
                {// TODO add `is-lang-${lang}` class, to body?
                oas[extensions.SAMPLES_LANGUAGES].map(lang => (
                  <li key={lang}>
                    {
                      // eslint-disable-next-line jsx-a11y/href-no-hash
                      <a
                        href="#"
                        className={`hub-lang-switch-${lang}`}
                        onClick={e => {
                          e.preventDefault();
                          setLanguage(lang);
                        }}
                      >
                        {generateCodeSnippet.getLangName(lang)}
                      </a>
                    }
                  </li>
                ))}
              </ul>
              <div className="hub-code-auto">
                <pre className={`tomorrow-night hub-lang hub-lang-${language}`}>
                  {snippet}
                </pre>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }
}

CodeSample.propTypes = {
  oas: PropTypes.instanceOf(Oas).isRequired,
  setLanguage: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  formData: PropTypes.shape({}).isRequired,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    }),
  ),
  language: PropTypes.string.isRequired,
};

CodeSample.defaultProps = {
  examples: [],
};

module.exports = CodeSample;
