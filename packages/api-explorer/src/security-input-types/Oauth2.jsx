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
