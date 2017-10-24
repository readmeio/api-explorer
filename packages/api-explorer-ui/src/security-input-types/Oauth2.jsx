const React = require('react');
const PropTypes = require('prop-types');

function Oauth2({ apiKey, inputRef, oauthUrl, change }) {
  if (!apiKey && oauthUrl) {
    return (
      <section>
        <div className="text-center">
          <a className="btn btn-primary" href={oauthUrl} target="_self">
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
          <input
            ref={inputRef}
            type="text"
            onChange={e => change(e.currentTarget.value)}
            name="apiKey"
          />
        </div>
      </div>
    </section>
  );
}

Oauth2.propTypes = {
  apiKey: PropTypes.string,
  oauthUrl: PropTypes.string,
  change: PropTypes.func.isRequired,
  inputRef: PropTypes.func,
};

Oauth2.defaultProps = {
  apiKey: '',
  oauthUrl: '',
  inputRef: () => {},
};

module.exports = Oauth2;
