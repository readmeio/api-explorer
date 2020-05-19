import {FormattedMessage} from 'react-intl'

import Result from './Result'
import {notJsonStyle} from './style'
import colors from '../../colors';

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

function renderPlainText(id, defaultMessage) {
  const style = {
    color: colors.white,
    padding: '5px 10px'
  }
  return (
    <div style={style}>
      <FormattedMessage id={id} defaultMessage={defaultMessage} />
    </div>
  )
}
function Unauthorized({ isOauth, oauth }) {
  return (
    <div style={notJsonStyle}>
      {isOauth ? hasOauth(oauth) : renderPlainText("api.auth.failed", "You couldn't be authenticated")}
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
function ResponseBody({ result, isOauth, oauth, isCollapsed}) {
  return (
    <div style={{ display: 'block', color: '#fff'}}>
      {result.status === 401 && <Unauthorized isOauth={isOauth} oauth={oauth} />}
      {result.responseBody ?
        <Result result={result} isCollapse={isCollapsed} /> :
        renderPlainText('response.noBody', 'The response has no body')
      }
    </div>
  );
}
ResponseBody.propTypes = {
  ...Unauthorized.propTypes,
  ...Result.propTypes,
  result: PropTypes.shape({
    status: PropTypes.number,
    responseBody: PropTypes.object,
  })
}

module.exports = ResponseBody;

ResponseBody.defaultProps = Unauthorized.defaultProps;
