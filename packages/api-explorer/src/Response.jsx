const React = require('react');
const classNames = require('classnames');
const PropTypes = require('prop-types');

const ResponseTabs = require('./ResponseTabs');
const ResponseMetadata = require('./ResponseMetadata');
const ResponseBody = require('./ResponseBody');
const ResponseExample = require('./ResponseExample');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

class Response extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      responseTab: 'result',
    };

    this.setTab = this.setTab.bind(this);
  }

  setTab(selected) {
    this.setState({ responseTab: selected });
  }

  render() {
    const { result, oas, operation, oauth, hideResults, exampleResponses } = this.props;
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
                  hideResults={hideResults}
                  oas={oas}
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
            exampleResponses={exampleResponses}
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
