const React = require('react');
const PropTypes = require('prop-types');

function ApiKey({ apiKey, scheme, authInputRef, change, Input }) {
  return (
    <div className="row">
      <div className="col-xs-5">
        <label htmlFor="apiKey">{scheme.name}</label>
      </div>
      <div className="col-xs-7">
        <Input inputRef={authInputRef} onChange={e => change(e.target.value)} type="text" value={apiKey} />
      </div>
    </div>
  );
}

ApiKey.propTypes = {
  apiKey: PropTypes.string,
  authInputRef: PropTypes.func,
  change: PropTypes.func.isRequired,
  Input: PropTypes.func.isRequired,
  scheme: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

ApiKey.defaultProps = {
  apiKey: undefined,
  authInputRef: () => {},
};

module.exports = ApiKey;
