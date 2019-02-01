const React = require('react');
const PropTypes = require('prop-types');

const Oauth2 = require('./security-input-types/Oauth2');
const ApiKey = require('./security-input-types/ApiKey');
const Basic = require('./security-input-types/Basic');

function SecurityInput(props) {
  function change(value) {
    return props.onChange({ [props.scheme._key]: value });
  }
  switch (props.scheme.type) {
    case 'oauth2':
      return <Oauth2 {...props} change={change} />;
    case 'http':
      if (props.scheme.scheme === 'basic') return <Basic {...props} change={change} />;
      if (props.scheme.scheme === 'bearer') return <Oauth2 {...props} change={change} />;
      break;
    case 'apiKey':
      return <ApiKey {...props} change={change} />;
    default:
      return null;
  }
}

SecurityInput.propTypes = {
  scheme: PropTypes.shape({
    type: PropTypes.string.isRequired,
    scheme: PropTypes.string,
    _key: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

module.exports = SecurityInput;
