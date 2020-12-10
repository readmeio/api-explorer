const React = require('react');
const classNames = require('classnames');
const PropTypes = require('prop-types');
const Oas = require('oas/tooling');

const ResponseTabs = require('./ResponseTabs');
const ResponseMetadata = require('./ResponseMetadata');
const ResponseBody = require('./ResponseBody');
const ResponseExample = require('./ResponseExample');

const upgradeLegacyResponses = require('./lib/upgrade-legacy-responses');

const { Operation } = Oas;

class Response extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      responseTab: 'result',
    };

    const { exampleResponses, operation } = props;

    if (exampleResponses.length) {
      // With https://github.com/readmeio/api-explorer/pull/312 we changed the shape of response examples, but
      // unfortunately APIs that are manually documented in ReadMe are still in the legacy shape so we need to adhoc
      // rewrite them to fit this new work.
      this.examples = upgradeLegacyResponses(exampleResponses);
    } else {
      this.examples = operation.getResponseExamples() || [];
    }

    this.setTab = this.setTab.bind(this);
  }

  setTab(selected) {
    this.setState({ responseTab: selected });
  }

  render() {
    const { hideResults, result, oas, operation, oauth } = this.props;
    const { responseTab } = this.state;
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
                <ResponseTabs
                  examples={this.examples}
                  hideResults={hideResults}
                  operation={operation}
                  responseTab={responseTab}
                  result={result}
                  setTab={this.setTab}
                />

                {responseTab === 'result' && (
                  <ResponseBody isOauth={!!securities.OAuth2} oauth={oauth} result={result} />
                )}
                {responseTab === 'metadata' && <ResponseMetadata result={result} />}
              </span>
            )}
          </div>

          <ResponseExample
            examples={this.examples}
            oas={oas}
            onChange={this.props.onChange}
            operation={operation}
            result={result}
          />
        </div>
      </div>
    );
  }
}

Response.propTypes = {
  // Responses from the manual API editor. OAS response examples are pulled within the constructor.
  exampleResponses: PropTypes.arrayOf(PropTypes.shape({})),

  hideResults: PropTypes.func.isRequired,
  oas: PropTypes.instanceOf(Oas).isRequired,
  oauth: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  result: PropTypes.shape({}),
};

Response.defaultProps = {
  exampleResponses: [],
  result: {},
};

module.exports = Response;
