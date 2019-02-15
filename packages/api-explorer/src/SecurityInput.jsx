const React = require('react');
const PropTypes = require('prop-types');

const Oauth2 = require('./security-input-types/Oauth2');
const ApiKey = require('./security-input-types/ApiKey');
const Basic = require('./security-input-types/Basic');

const types = {
  oauth2: Oauth2,
  apiKey: ApiKey,
};

function SecurityInput(props) {
  function change(value) {
    return props.onChange({ [props.scheme._key]: value });
  }
  switch (props.scheme.type) {
    case 'apiKey':
    case 'oauth2': {
      const Component = types[props.scheme.type];
      return <Component {...props} apiKey={props.auth[props.scheme._key]} change={change} />;
    }
    case 'http':
      // TODO support other schemes? https://github.com/readmeio/api-explorer/issues/15
      if (props.scheme.scheme === 'basic') {
        return (
          <Basic
            {...props}
            change={change}
            user={props.auth[props.scheme._key].user}
            pass={props.auth[props.scheme._key].pass}
          />
        );
      }
      if (props.scheme.scheme === 'bearer') {
        return <Oauth2 {...props} apiKey={props.auth[props.scheme._key]} change={change} />;
      }
      break;
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
  auth: PropTypes.shape({}),
};

SecurityInput.defaultProps = {
  auth: {},
};

module.exports = SecurityInput;
