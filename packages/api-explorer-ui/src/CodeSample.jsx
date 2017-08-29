const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('../../readme-oas-extensions');

const generateCodeSnippets = require('./lib/generate-code-snippets');

function CodeSample({ oas, setLanguage, path, method, formData }) {
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
                        href="#"
                        className={`hub-lang-switch-${lang}`}
                        onClick={(e) => { e.preventDefault(); setLanguage(lang); }}
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

        const snippets = generateCodeSnippets(oas, path, method, formData, oas[extensions.SAMPLES_LANGUAGES]);

        return (
          <div className="hub-code-auto">
            <i className="icon icon-sync icon-spin" />
            {
              Object.keys(snippets).map(lang => (
                <pre
                  key={lang}
                  className={`tomorrow-night hub-lang hub-lang-${lang}`}
                  dangerouslySetInnerHTML={{ __html: snippets[lang] }}
                />
              ))
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
  path: PropTypes.string.isRequired,
  method: PropTypes.string.isRequired,
};

module.exports = CodeSample;
