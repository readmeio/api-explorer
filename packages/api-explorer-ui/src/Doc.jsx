const React = require('react');
const PropTypes = require('prop-types');

const extensions = require('readme-oas-extensions');

const PathUrl = require('./PathUrl');
const Params = require('./Params');
const CodeSample = require('./CodeSample');

const getPath = require('./lib/get-path');
const getPathOperation = require('./lib/get-path-operation');
const showCode = require('./lib/show-code');

function Doc({ doc, oas, setLanguage }) {
  const path = getPath(oas, doc);
  const pathOperation = getPathOperation(oas, doc);

  return (
    <div className="hub-reference" id={`page-${doc.slug}`}>
      <a className="anchor-page-title" id={doc.slug} />

      <div className="hub-reference-section hub-reference-section-top">
        <div className="hub-reference-left">
          <header>
            {
            // TODO suggested edits
            }
            <h2>{doc.title}</h2>
            { doc.excerpt && <div className="excerpt" dangerouslySetInnerHTML={{ __html: doc.excerpt }} /> }
          </header>
        </div>
        <div className="hub-reference-right">&nbsp;</div>
      </div>

      {
        doc.type === 'endpoint' && (
        <div className="hub-api">
          <PathUrl oas={oas} path={doc.swagger.path} method={doc.api.method} />

          {
            showCode(oas, pathOperation) && (
              <div className="hub-reference-section hub-reference-section-code">
                <div className="hub-reference-left">
                  <CodeSample oas={oas} setLanguage={setLanguage} />
                </div>
                <div className="hub-reference-right"></div>
              </div>
            )
          }

          <div className="hub-reference-section">
            <div className="hub-reference-left">
              <Params swagger={oas} path={path} pathOperation={pathOperation} />
            </div>
            <div className="hub-reference-right switcher">
            </div>
          </div>
        </div>
        )
      }

      {
      // TODO maybe we dont need to do this with a hidden input now
      // cos we can just pass it around?
      }
      <input type="hidden" id={`swagger-${extensions.SEND_DEFAULTS}`} value={oas[extensions.SEND_DEFAULTS]} />
    </div>
  );
}

module.exports = Doc;

Doc.propTypes = {
  doc: PropTypes.shape({
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    slug: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    api: PropTypes.shape({
      method: PropTypes.string.isRequired,
    }).isRequired,
    swagger: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  oas: PropTypes.shape({}).isRequired,
  setLanguage: PropTypes.func.isRequired,
};
