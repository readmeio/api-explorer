const React = require('react');
const PropTypes = require('prop-types');
const Cookie = require('js-cookie');

function ApiKey({ scheme, authInputRef, change }) {
  const apiKeyCookie = Cookie.get('api_key');
  // apiKeyCookie = apiKeyCookie || {e => apiKey.change(e.currentTarget.value)};
  return (
    <div className="row">
      <div className="col-xs-5">
        <label htmlFor="apiKey">{scheme.name}</label>
      </div>
      <div className="col-xs-7">
        <input
          ref={authInputRef}
          type="text"
          onChange={e => change(e.currentTarget.value)}
          disabled={apiKeyCookie}
          value={apiKeyCookie}
        />
      </div>
    </div>
  );
}

ApiKey.propTypes = {
  scheme: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  authInputRef: PropTypes.func,
  change: PropTypes.func.isRequired,
};

ApiKey.defaultProps = {
  authInputRef: () => {},
};

module.exports = ApiKey;
