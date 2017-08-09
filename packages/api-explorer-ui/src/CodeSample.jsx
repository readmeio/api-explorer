const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('readme-oas-extensions');

function CodeSample({ oas }) {
  return (
    <div className="code-sample tabber-parent">
      {
        // if swaggerUtils.showCodeExamples(swagger).length
        //   ul.code-sample-tabs
        //     each example, index in swaggerUtils.showCodeExamples(swagger)
        //       - var name = example.name ? example.name : shared.code_type(example.language)
        //       li
        //         a.tabber-tab(href="" data-tab=index class=index===0 ? "selected" : "") #{name}
        // else if swagger[extensions.SAMPLES_ENABLED]
        //   ul.code-sample-tabs
        //     for lang in swagger[extensions.SAMPLES_LANGUAGES]
        //       li
        //         a(class="hub-lang-switch-#{lang}" ng-click="setLanguage('#{lang}')" href="")= swaggerUtils.getLangName(lang)
        // else
        //   .hub-no-code No code samples available
      }

      {(() => {
        if (oas[extensions.SAMPLES_ENABLED]) {
          return (
            <ul className="code-sample-tabs">
              {
                oas[extensions.SAMPLES_LANGUAGES].map(lang => {
                  return (
                    <li key={lang}>
                      <a className={`hub-lang-switch-${lang}`}>{lang}</a>
                    </li>
                  );
                })
              }
            </ul>
          );
        }
      })()}

    </div>
  );
}

CodeSample.propTypes = {
  oas: PropTypes.shape({}).isRequired,
};

module.exports = CodeSample;
