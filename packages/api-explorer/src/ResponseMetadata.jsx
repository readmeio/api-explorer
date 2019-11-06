const React = require('react');
const PropTypes = require('prop-types');
const IconStatus = require('./IconStatus');

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
  children: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
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

module.exports = ResponseMetadata;
