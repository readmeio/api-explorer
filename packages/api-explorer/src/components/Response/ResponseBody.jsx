import {FormattedMessage} from 'react-intl'

import Result from './Result'
import {notJsonStyle} from './style'

const React = require('react');
const PropTypes = require('prop-types');
const oauthHref = require('../../lib/oauth-href');

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
    <div style={notJsonStyle}>
      {isOauth ? hasOauth(oauth) : <p><FormattedMessage id="api.auth.failed" defaultMessage="You couldn't be authenticated" /></p>}
    </div>
  );
}

Unauthorized.propTypes = {
  isOauth: PropTypes.bool,
  oauth: PropTypes.bool.isRequired
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
