const React = require('react');
const PropTypes = require('prop-types');

function oauth2({ scheme, apiKey, oauthUrl }) {
  if (!apiKey && oauthUrl) {
    return (
      <section>
        <div className="text-center">
          <a className="btn btn-primary" href={oauthUrl} target="_self">Authenticate via OAuth2</a>
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
          <div style={{ display: 'inline-block', marginRight: '10px', marginTop: '5px', fontSize: '13px' }}>Bearer</div>
        </div>
        <div className="col-xs-6">
          <input type="text" value={apiKey} name="apiKey" />
        </div>
      </div>
    </section>
  );
}

function SecurityInput(props) {
  switch (props.scheme.type) {
    case 'oauth2':
      return oauth2(props);
  }
  return <span />;
}

SecurityInput.propTypes = {
  scheme: PropTypes.shape({}).isRequired,
  apiKey: PropTypes.string,
};

SecurityInput.defaultProps = {
  apiKey: '',
};

module.exports = SecurityInput;
