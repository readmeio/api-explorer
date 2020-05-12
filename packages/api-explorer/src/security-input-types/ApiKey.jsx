const React = require('react');
const PropTypes = require('prop-types');

function ApiKey({ apiKey, scheme, authInputRef, change, Input }) {
  return (
    <div>
      <div>
        <label htmlFor="apiKey">{scheme.name}</label>
      </div>
      <div>
        <Input
          inputRef={authInputRef}
          type="text"
          onChange={e => change(e.target.value)}
          value={apiKey}
        />
      </div>
    </div>
  );
}

ApiKey.propTypes = {
  apiKey: PropTypes.string,
  scheme: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  authInputRef: PropTypes.func,
  change: PropTypes.func.isRequired,
  Input: PropTypes.func.isRequired,
};

ApiKey.defaultProps = {
  apiKey: '',
  authInputRef: () => {},
};

module.exports = ApiKey;
