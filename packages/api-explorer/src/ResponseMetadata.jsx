import {injectIntl} from 'react-intl';

const React = require('react');
const IconStatus = require('./IconStatus');
const PropTypes = require('prop-types');

function Meta({ label, children }) {
  return (
    <div className="meta">
      {
        // eslint-disable-next-line jsx-a11y/label-has-for
        <label>{label}</label>
      }
      {children}
    </div>
  );
}

Meta.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function ResponseMetadata({ result, intl }) {
  return (
    <div
      className="hub-reference-results-meta tabber-body-metadata tabber-body"
      style={{ display: 'block' }}
    >
      <Meta label={intl.formatMessage({id: "api.metadata.method", defaultMessage: "Method"})}>
        <div>{result.method.toString()}</div>
      </Meta>

      <Meta label={intl.formatMessage({id: "api.metadata.url", defaultMessage: "URL"})}>
        <div>{result.url}</div>
      </Meta>

      <Meta label={intl.formatMessage({id: "api.metadata.requestheaders", defaultMessage: "Request Headers"})}>
        <pre>{result.requestHeaders.join('\n')}</pre>
      </Meta>

      <Meta label={intl.formatMessage({id: "api.metadata.requestbody", defaultMessage: "Request Data"})}>
        <pre>{result.requestBody}</pre>
      </Meta>

      <Meta label={intl.formatMessage({id: "api.metadata.status", defaultMessage: "Status"})}>
        <span className="httpstatus">
          <IconStatus status={result.status} />
        </span>
      </Meta>

      <Meta label={intl.formatMessage({id: "api.metadata.responseheaders", defaultMessage: "Response Headers"})}>
        <pre>{result.responseHeaders.join('\n')}</pre>
      </Meta>
    </div>
  );
}

module.exports = injectIntl(ResponseMetadata);

ResponseMetadata.propTypes = {
  result: PropTypes.shape({}).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};
