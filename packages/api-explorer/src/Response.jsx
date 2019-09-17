const React = require('react');
const classNames = require('classnames');
const PropTypes = require('prop-types');

const ResponseTabs = require('./ResponseTabs');
const ResponseMetadata = require('./ResponseMetadata');
const ResponseBody = require('./ResponseBody');
const Example = require('./Example');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

class Response extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      responseTab: 'result',
      exampleTab: 0,
    };
    this.setTab = this.setTab.bind(this);
    this.setExampleTab = this.setExampleTab.bind(this);
    this.setResponseExample = this.setResponseExample.bind(this);
    this.setResponseMediaType = this.setResponseMediaType.bind(this);
  }

  setTab(selected) {
    this.setState({ responseTab: selected });
  }

  setExampleTab(index) {
    this.setState({ exampleTab: index, responseMediaType: undefined, responseExample: undefined });
  }

  setResponseExample(index) {
    this.setState({ responseExample: index });
  }

  setResponseMediaType(example, index) {
    this.setState({ responseMediaType: index, responseMediaTypeExample: example });
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
                  result={result}
                  oas={oas}
                  operation={operation}
                  responseTab={responseTab}
                  setTab={this.setTab}
                  hideResults={hideResults}
                />

                {responseTab === 'result' && (
                  <ResponseBody result={result} oauth={oauth} isOauth={!!securities.OAuth2} />
                )}
                {responseTab === 'metadata' && <ResponseMetadata result={result} />}
              </span>
            )}
          </div>

          <Example
            operation={operation}
            result={result}
            oas={oas}
            selected={this.state.exampleTab}
            responseExample={this.state.responseExample}
            responseMediaType={this.state.responseMediaType}
            responseMediaTypeExample={this.state.responseMediaTypeExample}
            setExampleTab={this.setExampleTab}
            setResponseExample={this.setResponseExample}
            setResponseMediaType={this.setResponseMediaType}
            exampleResponses={exampleResponses}
          />
        </div>
      </div>
    );
  }
}

module.exports = Response;

Response.propTypes = {
  result: PropTypes.shape({}),
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  oauth: PropTypes.bool.isRequired,
  hideResults: PropTypes.func.isRequired,
  exampleResponses: PropTypes.arrayOf(PropTypes.shape({})),
};

Response.defaultProps = {
  result: {},
  exampleResponses: [],
};
