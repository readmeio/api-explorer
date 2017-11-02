const React = require('react');
const PropTypes = require('prop-types');
const syntaxHighlighter = require('../../readme-syntax-highlighter');

function Authorized({ result }) {
  return (
    <pre className="tomorrow-night">
      {result.isBinary && <div>A binary file was returned</div>}
      {!result.isBinary && (
        <div
          className="cm-s-tomorrow-night codemirror-highlight"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: syntaxHighlighter(JSON.stringify(result.responseBody), 'javascript'),
          }}
        />
      )}
    </pre>
  );
}

Authorized.propTypes = {
  result: PropTypes.shape({}).isRequired,
};

function hasOauth(oauthUrl) {
  if (!oauthUrl) return <p>Your OAuth2 token is incorrect or has expired</p>;

  return (
    <div>
      <p>Your OAuth2 token has expired</p>
      <a className="btn btn-primary" href="/oauth" target="_self">
        Reauthenticate via OAuth2
      </a>
    </div>
  );
}

function Unauthorized({ isOauth, oauthUrl }) {
  return (
    <div className="text-center hub-expired-token">
      {isOauth ? hasOauth(oauthUrl) : <p>You couldn&apos;t be authenticated</p>}
    </div>
  );
}

Unauthorized.propTypes = {
  isOauth: PropTypes.bool,
  oauthUrl: PropTypes.string,
};

Unauthorized.defaultProps = {
  isOauth: false,
  oauthUrl: '',
};

function ResponseBody({ result, isOauth, oauthUrl }) {
  return (
    <div className="tabber-body tabber-body-result" style={{ display: 'block' }}>
      {result.status !== 401 && <Authorized result={result} />}
      {result.status === 401 && <Unauthorized isOauth={isOauth} oauthUrl={oauthUrl} />}
    </div>
  );
}

module.exports = ResponseBody;

ResponseBody.propTypes = Object.assign({}, Unauthorized.propTypes, Authorized.propTypes);

ResponseBody.defaultProps = Unauthorized.propTypes;
