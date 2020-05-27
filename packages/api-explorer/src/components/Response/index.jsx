import React, {Fragment} from 'react'
import {FormattedMessage} from 'react-intl'
import PropTypes from 'prop-types'

import BlockWithTab from '../BlockWithTab'
import IconStatus from '../../IconStatus'
import CopyCode from '../CopyCode'

const ResponseMetadata = require('./ResponseMetadata');
const ResponseBody = require('./ResponseBody');
const showCodeResults = require('../../lib/show-code-results');
const contentTypeIsJson = require('../../lib/content-type-is-json');

const Oas = require('../../lib/Oas');

const { Operation } = Oas;
const ctaContainerStyle = {
  borderTop: '2px solid #fff',
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '5px',
  paddingRight: '10px',
  paddingBottom: '0px',
}
const placeholderStyle = {
  textAlign: 'center',
  padding: '40px 0',
  color: 'rgba(255,255,255,0.7)',
  fontStyle: 'italic',
  fontSize: '14px',
}

class Response extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      responseTab: 'result',
      exampleTab: 0,
      collapse: undefined
    };
    this.setTab = this.setTab.bind(this);
    this.setExampleTab = this.setExampleTab.bind(this);
    this.onCollapseAll = this.onCollapseAll.bind(this);
    this.onExpandAll = this.onExpandAll.bind(this);
  }

  onCollapseAll (e) {
    e.preventDefault()
    this.setState({ collapse: true })
  }

  onExpandAll (e) {
    e.preventDefault()
    this.setState({ collapse: false })
  }

  setTab(selected) {
    this.setState({ responseTab: selected });
  }

  setExampleTab(index) {
    this.setState({ exampleTab: index });
  }

  render() {
    const { result, operation, oauth, hideResults } = this.props;
    const { responseTab, collapse } = this.state;
    const securities = operation.prepareSecurity();

    const isString = result && (typeof result.responseBody === 'string')
    const isJson = result && result.type &&
      contentTypeIsJson(result.type) &&
      typeof result.responseBody === 'object';

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
      <div>
        {result !== null ? (
          <BlockWithTab
            items={itemsResult}
            selected={responseTab}
            onClick={this.setTab}
          >
            <div style={ctaContainerStyle}>
              <CopyCode code={isString ? result.responseBody : JSON.stringify(result.responseBody)} />
              {!result.isBinary && isJson ? (
                <Fragment>
                  <a href={''} className="mia-ctc-button" onClick={(e) => this.onCollapseAll(e)}>
                    <FormattedMessage id="code.collapseAll" defaultMessage="Collapse all" />
                  </a>
                  <a href={''} className="mia-ctc-button" onClick={(e) => this.onExpandAll(e)}>
                    <FormattedMessage id="code.expandAll" defaultMessage="Expand all" />
                  </a>
                </Fragment>
                ) : null}
            </div>

            <div style={{maxHeight: '400px', padding: '10px', overflow: 'hidden scroll'}}>
              {
                responseTab === 'result' ? (
                  <ResponseBody
                    result={result}
                    oauth={oauth}
                    isOauth={!!securities.OAuth2}
                    isCollapsed={collapse}
                  />
                ) : null
              }
              {responseTab === 'metadata' && <ResponseMetadata result={result} />}
            </div>
          </BlockWithTab>) : (
            <div style={placeholderStyle}>
              <FormattedMessage id="tryit" defaultMessage="Try the API to see Results" />
            </div>
          )
        }
      </div>
    );
  }
}

module.exports = Response;

Response.propTypes = {
  result: PropTypes.shape({
    responseBody: PropTypes.object,
    isBinary: PropTypes.bool,
    status: PropTypes.number,
    type: PropTypes.string
  }),
  operation: PropTypes.instanceOf(Operation).isRequired,
  oauth: PropTypes.bool.isRequired,
  hideResults: PropTypes.func.isRequired,
};
Response.defaultProps = {
  result: {},
  exampleResponses: [],
};
