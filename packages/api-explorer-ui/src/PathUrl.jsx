const React = require('react');
const PropTypes = require('prop-types');

const extensions = require('readme-oas-extensions');

function splitPath(path) {
  return path.split(/({\w.+})/).filter(Boolean).map(part => {
    return { type: part.match(/[{}]/) ? 'variable' : 'text', value: part.replace(/[{}]/g, '') };
  });
}

function PathUrl({ oas, path, method }) {
  return (
    <div className="api-definition-parent">
      <div className="api-definition">
        <div className="api-definition-container">
          { oas[extensions.EXPLORER_ENABLED] &&

            <div className="api-definition-actions">
              {
              // <!-- oasUtils.hasAuth(oas) && -->
              //   <!-- authBox -->
              }
              <button className="api-try-it-out" type="submit" ng-disabled="results.loading" ng-className="{active: endpointForm.$dirty}">
                <span className="fa fa-compass" ng-show='!results.loading'></span>
                <span ng-show="!results.loading"></span>
                <i className="fa fa-circle-o-notch fa-spin" ng-show='results.loading'></i>

              </button>
            </div>
          }

          <span className={`pg-type-big pg-type type-${method}`}>{method}</span>

          { (oas.servers && oas.servers.length > 0) &&

            <span className="definition-url">
              <span className="url">{oas.servers[0].url}</span>
              {
                splitPath(path).map((part) => {
                  return <span key={part.value} className={`api-${part.type}`}>{part.value}</span>;
                })
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
  method: PropTypes.string.isRequired,
};

module.exports = PathUrl;
