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

function ResponseMetadata({ result }) {
  return (
    <div
      className="hub-reference-results-meta tabber-body-metadata tabber-body"
      style={{ display: 'block' }}
    >
      <Meta label="Method">
        <div>{result.method.toString()}</div>
      </Meta>

      <Meta label="URL">
        <div>{result.url}</div>
      </Meta>

      <Meta label="Request Headers">
        <pre>{result.requestHeaders.join('\n')}</pre>
      </Meta>

      <Meta label="Request Data">
        <pre>{result.requestBody}</pre>
      </Meta>

      <Meta label="Status">
        <span className="httpstatus">
          <IconStatus status={result.status} />
        </span>
      </Meta>

      <Meta label="Response Headers">
        <pre>{result.responseHeaders.join('\n')}</pre>
      </Meta>
    </div>
  );
}

module.exports = ResponseMetadata;

ResponseMetadata.propTypes = {
  result: PropTypes.shape({
    method: PropTypes.string,
    requestBody: PropTypes.string,
    requestHeaders: PropTypes.array,
    responseHeaders: PropTypes.array,
    status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    url: PropTypes.string,
  }).isRequired,
};
