import { injectIntl } from 'react-intl';

import colors from '../../colors'

const React = require('react');
const IconStatus = require('../../IconStatus');
const PropTypes = require('prop-types');


function Meta({ label, children }) {
  const style = {
    label: {
      textTransform: 'uppercase',
      fontSize: 11,
      marginBottom: 3,
      color: colors.metadataLabel
    },
    content: {
      margin: '0px 10px',
      padding: 0,
      fontSize: 11,
      fontFamily: 'monospace',
      color: colors.metadataContent
    },
    container: {
      display: 'grid', 
      gridTemplateColumns: '1fr', 
      gridTemplateRows: 'auto 1fr',
      padding: 5
    }
  }
  return (
    <div style={style.container}>
      {
        // eslint-disable-next-line jsx-a11y/label-has-for
        <label style={style.label}>{label}</label>
      }
      <div style={style.content}>
        {children}
      </div>
    </div>
  );
}

Meta.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function ResponseMetadata({ result, intl }) {
  return (
    <div style={{ display: 'block' }}>
      <Meta label={intl.formatMessage({id: 'api.method', defaultMessage: 'Method'})}>
        {result.method.toString()}
      </Meta>

      <Meta label={intl.formatMessage({id: 'api.url', defaultMessage: 'URL'})}>
        {result.url}
      </Meta>

      <Meta label={intl.formatMessage({id: 'api.request.headers', defaultMessage: 'Request Headers'})}>
        {result.requestHeaders.join('\n')}
      </Meta>

      {
        result.requestBody ? (
          <Meta label={intl.formatMessage({id: 'api.request.data', defaultMessage: 'Request Data'})}>
            {result.requestBody}
          </Meta>
        ) : null
      }

      <Meta label={intl.formatMessage({id: 'api.response.status', defaultMessage: 'Status'})}>
        <span className="httpstatus">
          <IconStatus status={result.status} />
        </span>
      </Meta>

      <Meta label={intl.formatMessage({id: 'api.response.headers', defaultMessage: 'Response Headers'})}>
        {result.responseHeaders.join('\n')}
      </Meta>
    </div>
  );
}

module.exports = injectIntl(ResponseMetadata);

ResponseMetadata.propTypes = {
  result: PropTypes.shape({}).isRequired,
  intl: PropTypes.func.isRequired,
};
