const React = require('react');
const PropTypes = require('prop-types');

function ApiKey({ apiKey, scheme, authInputRef, change }) {
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
          value={apiKey}
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
