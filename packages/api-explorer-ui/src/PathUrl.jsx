const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');

const AuthBox = require('./AuthBox');

const extensions = require('../../readme-oas-extensions');

function splitPath(path) {
  return path.split(/({\w.+})/).filter(Boolean).map((part) => {
    return { type: part.match(/[{}]/) ? 'variable' : 'text', value: part.replace(/[{}]/g, '') };
  });
}

function PathUrl({ oas, path, operationId, method, loading, dirty }) {
  return (
    <div className="api-definition-parent">
      <div className="api-definition">
        <div className="api-definition-container">
          { oas[extensions.EXPLORER_ENABLED] &&

            <div className="api-definition-actions">
              {
                <AuthBox oas={oas} path={path} method={method} />
              }

              <button form={`form-${operationId}`} className={classNames('api-try-it-out', { active: dirty })} type="submit" disabled={loading}>
                {
                  !loading && (
                    <span className="try-it-now-btn">
                      <span className="fa fa-compass" />&nbsp;
                      <span>Try It</span>
                    </span>
                  )
                }

                {
                  loading && <i className="fa fa-circle-o-notch fa-spin" />
                }
              </button>
            </div>
          }

          <span className={`pg-type-big pg-type type-${method}`}>{method}</span>

          { (oas.servers && oas.servers.length > 0) &&

            <span className="definition-url">
              <span className="url">{oas.servers[0].url}</span>
              {
                splitPath(path).map(part =>
                  <span key={part.value} className={`api-${part.type}`}>{part.value}</span>,
                )
              }
            </span>

          }

        </div>
      </div>
    </div>
  );
}

PathUrl.propTypes = {
  oas: PropTypes.shape({
    servers: PropTypes.array.isRequired,
  }).isRequired,
  path: PropTypes.string.isRequired,
  method: PropTypes.string.isRequired,
};

module.exports = PathUrl;
