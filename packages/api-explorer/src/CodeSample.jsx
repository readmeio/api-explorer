const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const Oas = require('./lib/Oas');

const { Operation } = Oas;

const CopyCode = require('./CopyCode');

const syntaxHighlighter = require('@readme/syntax-highlighter');

const generateCodeSnippet = require('./lib/generate-code-snippet');

class CodeSample extends React.Component {
  getKey(example, index) {
    const key = `${example.language}-${index}`;
    const selected = this.isSelected(example, index);
    return { key, selected };
  }

  isSelected(source, index) {
    const { example } = this.props;
    const defaultSelection = index === 0 && !example.language;
    const isSame = source.language === example.language && source.name === example.name;
    return defaultSelection || isSame;
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
                {
                  // eslint-disable-next-line jsx-a11y/href-no-hash
                  <a
                    href="#"
                    className={selectedClass}
                    onClick={e => {
                      e.preventDefault();
                      setLanguage(example.language);
                      this.props.setExample(example);
                    }}
                  >
                    {example.name || generateCodeSnippet.getLangName(example.language)}
                  </a>
                }
              </li>
            );
          })}
        </ul>
        <div className="code-sample-body">
          {examplesWithLanguages.map((example, index) => {
            const { key, selected } = this.getKey(example, index);
            return (
              <div style={{ display: selected ? 'block' : 'none' }}>
                <CopyCode key={`copy-${key}`} code={example.code} />
                <pre
                  className="tomorrow-night tabber-body"
                  key={key} // eslint-disable-line react/no-array-index-key
                  style={{ display: selected ? 'block' : '' }}
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
          if (examples.length) return this.renderSelected(examples, setLanguage);
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
              {snippet && (
                <div className="hub-code-auto">
                  <CopyCode code={code} />
                  <pre className={`tomorrow-night hub-lang hub-lang-${language}`}>{snippet}</pre>
                </div>
              )}
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
  setExample: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  formData: PropTypes.shape({}).isRequired,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    }),
  ),
  language: PropTypes.string.isRequired,
  example: PropTypes.shape({}),
};

CodeSample.defaultProps = {
  examples: [],
  example: {},
};

module.exports = CodeSample;
