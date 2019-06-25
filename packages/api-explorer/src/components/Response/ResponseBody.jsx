import {FormattedMessage} from 'react-intl';
import { Fragment } from 'react';

import colors from '../../colors'

const React = require('react');
const PropTypes = require('prop-types');
const syntaxHighlighter = require('@mia-platform/syntax-highlighter');
const ReactJson = require('react-json-view').default;
const contentTypeIsJson = require('../../lib/content-type-is-json');
const oauthHref = require('../../lib/oauth-href');

const notJsonStyle = {
  fontSize: 12,
  fontFamily: 'Monaco, "Lucida Console", monospace',
  border: 0,
  background: 'transparent',
  padding: '0 30px',
  overflow: 'visible',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  color: colors.notJson
}

function Result({ result }) {
  const isJson =
    result.type && contentTypeIsJson(result.type) && typeof result.responseBody === 'object';

  return (
    <div>
      {result.isBinary && <div><FormattedMessage id="api.response.binary" defaultMessage="A binary file was returned" /></div>}
      {!result.isBinary &&
      isJson && (
        <ReactJson
          src={result.responseBody}
          collapsed={1}
          collapseStringsAfterLength={100}
          enableClipboard={false}
          theme="tomorrow"
          name={null}
          displayDataTypes={false}
          displayObjectSize={false}
          style={{
            padding: '20px 10px',
            backgroundColor: 'transparent',
            color: colors.reactJson,
            fontSize: '12px',
            overflow: 'visible',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        />
      )}
      {!result.isBinary &&
      !isJson && (
        <pre className="tomorrow-night" style={notJsonStyle}>
          <div className="cm-s-tomorrow-night codemirror-highlight">
            {syntaxHighlighter(result.responseBody, result.type)}
          </div>
        </pre>
      )}
    </div>
  );
}

Result.propTypes = {
  result: PropTypes.shape({}).isRequired,
};

function hasOauth(oauth) {
  if (!oauth) return <p><FormattedMessage id="api.oauth2.invalid" defaultMessage="Your OAuth2 token is incorrect or has expired" /></p>;

  return (
    <div>
      <p><FormattedMessage id="api.oauth2.expired" defaultMessage="Your OAuth2 token has expired" /></p>
      <a className="btn btn-primary" href={oauthHref()} target="_self">
        <FormattedMessage id="api.oauth2.reauthenticate" defaultMessage="Reauthenticate via OAuth2" />
      </a>
    </div>
  );
}

function Unauthorized({ isOauth, oauth }) {
  return (
    <Fragment>
      <div style={notJsonStyle}>
        {isOauth ? hasOauth(oauth) : <p><FormattedMessage id="api.auth.failed" defaultMessage="You couldn't be authenticated" /></p>}
      </div>
    </Fragment>
  );
}

Unauthorized.propTypes = {
  isOauth: PropTypes.bool,
  oauth: PropTypes.bool.isRequired,
  result: PropTypes.shape({}).isRequired
};

Unauthorized.defaultProps = {
  isOauth: false,
};

// eslint-disable-next-line react/prop-types
function ResponseBody({ result, isOauth, oauth }) {
  return (
    <div style={{ display: 'block'}}>
      {
        result.status === 401 && <Unauthorized isOauth={isOauth} oauth={oauth} />
      }
      {
        result.responseBody ? <Result result={result} /> 
        : <FormattedMessage id={'response.noBody'} default={'The response has no body'} />
      } 
    </div>
  );
}

module.exports = ResponseBody;

ResponseBody.propTypes = Object.assign({}, Unauthorized.propTypes, Result.propTypes);

ResponseBody.defaultProps = Unauthorized.defaultProps;
