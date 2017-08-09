const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('readme-oas-extensions');
const classNames = require('classnames');

function CodeSample({ oas, setLanguage }) {
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
                // TODO add `is-lang-${lang}` class, to body?
                oas[extensions.SAMPLES_LANGUAGES].map(lang =>
                  (
                    <li key={lang}>
                      <a
                        role="link"
                        className={`hub-lang-switch-${lang}`}
                        onClick={setLanguage.bind(null, lang)}
                      >{lang}</a>
                    </li>
                  ),
                )
              }
            </ul>
          );
        }

        return <div className="hub-no-code">No code samples available</div>;
      })()}

      {
        // if swaggerUtils.showCodeExamples(swagger).length
        //   .code-sample-body
        //     each example, index in swaggerUtils.showCodeExamples(swagger)
        //       pre.tomorrow-night.tabber-body(style=index === 0 ? "display: block;" : "" class="tabber-body-#{index}")!= replaceVars(codemirror(example.code, example.language, true), variables)
        // else if swagger[extensions.SAMPLES_ENABLED]
        //   -var codes = swaggerUtils.getCodeSnippet(swagger, swagger[extensions.SAMPLES_LANGUAGES]);
        //   .hub-code-auto
        //     i.icon.icon-sync.icon-spin.ng-cloak(ng-show="codeLoading")
        //     for lang in swagger[extensions.SAMPLES_LANGUAGES]
        //       pre.tomorrow-night.hub-lang(class="hub-lang-#{lang}")!= codes[lang]

        // .clear
      }

      {(() => {
        if (!oas[extensions.SAMPLES_ENABLED]) return null;

        return (
          <div className="hub-code-auto">
            <i className="icon icon-sync icon-spin" ng-show="codeLoading" />
            {
              oas[extensions.SAMPLES_LANGUAGES].map(lang =>
                (
                  <pre key={lang} className={`tomorrow-night hub-lang hub-lang-${lang}`}>
                    {lang}
                  </pre>
                ),
              )
            }
          </div>
        );
      })()}

    </div>
  );
}

CodeSample.propTypes = {
  oas: PropTypes.shape({}).isRequired,
  setLanguage: PropTypes.func.isRequired,
};

module.exports = CodeSample;
