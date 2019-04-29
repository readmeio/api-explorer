import BlockWithTab from '../BlockWithTab'
import IconStatus from '../../IconStatus'

const React = require('react');

const PropTypes = require('prop-types');

const ResponseMetadata = require('./ResponseMetadata');
const ResponseBody = require('./ResponseBody');
const Example = require('./Example');
const showCodeResults = require('../../lib/show-code-results');

const Oas = require('../../lib/Oas');

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
    let itemsResult = []
    if (result) {
      itemsResult = [
        {value: 'result', label: <IconStatus status={result.status} />},
        {value: 'metadata', label: 'Metadata'},
      ]
      if (showCodeResults(operation).length > 0) {
        itemsResult.push({label: 'to examples', onClick: hideResults})
      }
    }
    
    return (
      <div className="code-sample">
        {result !== null ? (
          <BlockWithTab
            items={itemsResult}
            selected={responseTab}
            onClick={this.setTab} 
          >
            {responseTab === 'result' && (
            <ResponseBody result={result} oauth={oauth} isOauth={!!securities.OAuth2} />
              )}
            {responseTab === 'metadata' && <ResponseMetadata result={result} />}
          </BlockWithTab>
        ) : (
          <Example
            operation={operation}
            result={result}
            oas={oas}
            selected={this.state.exampleTab}
            setExampleTab={this.setExampleTab}
            exampleResponses={exampleResponses}
          />
        )}
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
