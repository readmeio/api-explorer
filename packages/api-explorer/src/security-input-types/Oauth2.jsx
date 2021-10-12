import {FormattedMessage} from 'react-intl';

const React = require('react');
const PropTypes = require('prop-types');
const oauthHref = require('../lib/oauth-href');

function Oauth2({ apiKey, authInputRef, oauth, change, Input }) {
  if (!apiKey && oauth) {
    return (
      <section>
        <div className="text-center">
          <a className="btn btn-primary" href={oauthHref()} target="_self">
            <FormattedMessage id="auth.oauth2.info" defaultMessage="Authenticate via OAuth2" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div>
        <div>
          <label htmlFor="apiKey">
            <FormattedMessage id="auth.oauth2.authorization" defaultMessage="authorization" />
          </label>
        </div>
        <div>
          <Input
            inputRef={authInputRef}
            disabled={oauth}
            type="text"
            onChange={e => change(e.target.value)}
            name="apiKey"
            value={apiKey}
          />
        </div>
      </div>
    </section>
  );
}

Oauth2.propTypes = {
  apiKey: PropTypes.string,
  oauth: PropTypes.bool.isRequired,
  change: PropTypes.func.isRequired,
  authInputRef: PropTypes.func,
  Input: PropTypes.func.isRequired,
};

Oauth2.defaultProps = {
  apiKey: undefined,
  authInputRef: () => {},
};

module.exports = Oauth2;
