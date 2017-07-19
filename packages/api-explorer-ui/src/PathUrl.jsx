const React = require('react');

const extensions = require('readme-oas-extensions');

module.exports = function PathUrl({ swagger, method }) {
  return (
    <div className="api-definition-parent">
      <div className="api-definition">
        <div className="api-definition-container">
          { swagger[extensions.EXPLORER_ENABLED] &&

            <div className="api-definition-actions">
              {
              // <!-- swaggerUtils.hasAuth(swagger) && -->
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

          { (swagger.servers && swagger.servers.length > 0) &&

            <span className="definition-url">
              <span>{swagger.servers[0].url}</span>

              {
              // <!-- for section in swaggerUtils.chunkUrl(swagger)
              //   if section.type == 'variable'
              //     span.api-variable= section.value
              //   if section.type == 'text'
              //     span= section.value -->
              }
            </span>

          }

        </div>
      </div>
    </div>
  );
}
