const React = require('react');
const PropTypes = require('prop-types');

const Oauth2 = require('./security-input-types/Oauth2');
const ApiKey = require('./security-input-types/ApiKey');
const Basic = require('./security-input-types/Basic');

const getAuth = require('./lib/get-auth');

function SecurityInput(props) {
  function change(value) {
    return props.onChange({ [props.scheme._key]: value });
  }
  const auth = getAuth(props.user, props.scheme);
  switch (props.scheme.type) {
    case 'oauth2':
      return <Oauth2 {...props} apiKey={auth} change={change} />;
    case 'http':
      // TODO support other schemes? https://github.com/readmeio/api-explorer/issues/15
      return <Basic {...props} change={change} user={auth.user} pass={auth.pass} />;
    case 'apiKey':
      return <ApiKey {...props} apiKey={auth} change={change} />;
    default:
      return null;
  }
}

SecurityInput.propTypes = {
  scheme: PropTypes.shape({
    type: PropTypes.string.isRequired,
    _key: PropTypes.string.isRequired,
  }).isRequired,
  user: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
};

SecurityInput.defaultProps = {
  user: {},
};

module.exports = SecurityInput;
