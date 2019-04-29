import BlockWithTab from '../BlockWithTab'
import IconStatus from '../../IconStatus'

const React = require('react');

const PropTypes = require('prop-types');

const ResponseMetadata = require('./ResponseMetadata');
const ResponseBody = require('./ResponseBody');
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
    const { result, operation, oauth, hideResults } = this.props;
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
    
    const placeholderStyle = {
      textAlign: 'center',
      padding: '40px 0',
      color: 'rgba(255,255,255,0.7)',
      fontStyle: 'italic',
      fontSize: '14px',
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
          <div style={placeholderStyle}>Try the API to see Results</div>
        )}
      </div>
    );
  }
}

module.exports = Response;

Response.propTypes = {
  result: PropTypes.shape({}),
  operation: PropTypes.instanceOf(Operation).isRequired,
  oauth: PropTypes.bool.isRequired,
  hideResults: PropTypes.func.isRequired,
};

Response.defaultProps = {
  result: {},
  exampleResponses: [],
};
