const React = require('react');
const PropTypes = require('prop-types');

const oauthHref = require('../lib/oauth-href');

function Oauth2({ apiKey, authInputRef, oauth, change, Input }) {
  if (!apiKey && oauth) {
    return (
      <section>
        <div className="text-center">
          <a className="btn btn-primary" href={oauthHref()} target="_self">
            Authenticate via OAuth2
          </a>
        </div>
      </section>
    );
  }

  return (
    <section>
      {
        // TODO
        //   if security.description
        //     != marked(security.description)
      }
      <div className="row">
        <div className="col-xs-4">
          <label htmlFor="apiKey">Authorization</label>
        </div>
        <div className="col-xs-2">
          <div
            style={{
              display: 'inline-block',
              marginRight: '10px',
              marginTop: '5px',
              fontSize: '13px',
            }}
          >
            Bearer
          </div>
        </div>
        <div className="col-xs-6">
          <Input
            disabled={oauth}
            inputRef={authInputRef}
            name="apiKey"
            onChange={e => change(e.target.value)}
            type="text"
            value={apiKey}
          />
        </div>
      </div>
    </section>
  );
}

Oauth2.propTypes = {
  apiKey: PropTypes.string,
  authInputRef: PropTypes.func,
  change: PropTypes.func.isRequired,
  Input: PropTypes.func.isRequired,
  oauth: PropTypes.bool.isRequired,
};

Oauth2.defaultProps = {
  apiKey: undefined,
  authInputRef: () => {},
};

module.exports = Oauth2;
