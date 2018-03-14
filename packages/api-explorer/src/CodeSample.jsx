const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const Oas = require('./lib/Oas');

const { Operation } = Oas;

const syntaxHighlighter = require('@readme/syntax-highlighter');

const generateCodeSnippet = require('./lib/generate-code-snippet');

function CodeSample({ oas, setLanguage, operation, formData, language, customCodeSamples }) {
  return (
    <div className="code-sample tabber-parent">
      {(() => {
        if (!oas[extensions.SAMPLES_ENABLED]) {
          return <div className="hub-no-code">No code samples available</div>;
        }

        const snippet = generateCodeSnippet(oas, operation, formData, language);

        if (customCodeSamples.length) {
          return (
            <div>
              <ul className="code-sample-tabs">
                {customCodeSamples.map(example => (
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
                        {generateCodeSnippet.getLangName(example.language)}
                      </a>
                    }
                  </li>
                ))}
              </ul>
              <div className="code-sample-body">
                {customCodeSamples.map(example => {
                  return (
                    <pre
                      className="tomorrow-night tabber-body"
                      style={{ display: language === example.language ? 'block' : '' }}
                      key={example.language} // eslint-disable-line react/no-array-index-key
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{
                        __html: syntaxHighlighter(example.code, example.language, true),
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        }
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

CodeSample.propTypes = {
  oas: PropTypes.instanceOf(Oas).isRequired,
  setLanguage: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  formData: PropTypes.shape({}).isRequired,
  customCodeSamples: PropTypes.shape([]),
  language: PropTypes.string.isRequired,
};

CodeSample.defaultProps = {
  customCodeSamples: [],
};
module.exports = CodeSample;
