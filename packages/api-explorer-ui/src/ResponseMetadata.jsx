const React = require('react');
const IconStatus = require('./IconStatus');
const PropTypes = require('prop-types');

function ResponseMetadata({ result }) {
  return (
    <div
      className="hub-reference-results-meta tabber-body-metadata tabber-body"
      style={{ display: 'block' }}
    >
      <div className="meta">
        {
          // eslint-disable-next-line jsx-a11y/label-has-for
          <label>Method</label>
        }
        <div>{result.method.toString()}</div>
      </div>

      <div className="meta">
        {
          // eslint-disable-next-line jsx-a11y/label-has-for
          <label>URL</label>
        }
        <div>{result.url}</div>
      </div>

      <div className="meta">
        {
          // eslint-disable-next-line jsx-a11y/label-has-for
          <label>Request Headers</label>
        }
        <pre>{result.requestHeaders.join('\n')}</pre>
      </div>

      <div className="meta">
        {
          // eslint-disable-next-line jsx-a11y/label-has-for
          <label>Request Data</label>
        }
        <pre>{JSON.stringify(result.responseBody)}</pre>
      </div>

      <div className="meta">
        {
          // eslint-disable-next-line jsx-a11y/label-has-for
          <label> Status</label>
        }
        <span className="httpstatus">
          <IconStatus result={result} />
        </span>
      </div>

      <div className="meta">
        {
          // eslint-disable-next-line jsx-a11y/label-has-for
          <label>Response Headers</label>
        }
        <pre>{result.responseHeaders.join('\n')}</pre>
      </div>
    </div>
  );
}

module.exports = ResponseMetadata;

ResponseMetadata.propTypes = {
  result: PropTypes.shape({}).isRequired,
};
