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
  }

  setTab(selected) {
    this.setState({ responseTab: selected });
  }

  setExampleTab(index) {
    this.setState({ exampleTab: index });
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
        style={{background: '#000'}}
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
            setExampleTab={this.setExampleTab}
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
