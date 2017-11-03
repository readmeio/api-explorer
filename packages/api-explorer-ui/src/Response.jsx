const React = require('react');
const classNames = require('classnames');
const PropTypes = require('prop-types');

const ResponseTabs = require('./ResponseTabs');
const ResponseMetadata = require('./ResponseMetadata');
const ResponseBody = require('./ResponseBody');
const Example = require('./Example');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

function Response({ result, oas, operation, oauthUrl }) {
  const securities = operation.prepareSecurity();

  return (
    <div
      className={classNames('hub-reference-right hub-reference-results tabber-parent', {
        on: result !== null,
      })}
    >
      <div className="hub-reference-results-slider">
        <div className="hub-reference-results-explorer code-sample">
          {result !== null && (
            <span>
              <ResponseTabs result={result} oas={oas} operation={operation} />

              {this.state.selectedTab === 'result' && (
                <ResponseBody result={result} oauthUrl={oauthUrl} isOauth={!!securities.OAuth2} />
              )}
              {this.state.selectedTab === 'metadata' && <ResponseMetadata result={result} />}
            </span>
          )}
        </div>
        <Example operation={operation} result={result} oas={oas} />
      </div>
    </div>
  );
}

module.exports = Response;

Response.propTypes = {
  result: PropTypes.shape({}),
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  oauthUrl: PropTypes.string,
};

Response.defaultProps = {
  result: {},
  oauthUrl: '',
};
