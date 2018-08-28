const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const Oas = require('./lib/Oas');

const { Operation } = Oas;

const CopyCode = require('./CopyCode');

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
              <div style={{ display: this.props.language === example.language ? 'block' : 'none' }}>
                <CopyCode key={`copy-${example.language}`} code={example.code} />
                <pre
                  className="tomorrow-night tabber-body"
                  key={example.language} // eslint-disable-line react/no-array-index-key
                  style={{ display: this.props.language === example.language ? 'block' : '' }}
                >
                  {syntaxHighlighter(example.code || '', example.language, { dark: true })}
                </pre>
              </div>
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
          if (examples.length) return this.renderExamples(examples, setLanguage);
          if (!oas[extensions.SAMPLES_ENABLED]) {
            return <div className="hub-no-code">No code samples available</div>;
          }
          const { snippet, code } = generateCodeSnippet(oas, operation, formData, language);
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
                <CopyCode code={code} />
                <pre
                  className={`tomorrow-night hub-lang hub-lang-${language}`}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: snippet }}
                />
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
