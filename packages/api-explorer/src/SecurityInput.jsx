const React = require('react');
const PropTypes = require('prop-types');
const DebounceInput = require('react-debounce-input');

const Oauth2 = require('./security-input-types/Oauth2');
const ApiKey = require('./security-input-types/ApiKey');
const Basic = require('./security-input-types/Basic');

const types = {
  oauth2: Oauth2,
  apiKey: ApiKey,
};

class Input extends React.Component {
  render() {
    return (
      <DebounceInput
        {...this.props}
        debounceTimeout={process.env.NODE_ENV === 'test' ? 0 : 300}
        minLength={0}
      />
    );
  }
}

function SecurityInput(props) {
  function change(value) {
    return props.onChange({ [props.scheme._key]: value });
  }

  switch (props.scheme.type) {
    case 'apiKey':
    case 'oauth2': {
      const Component = types[props.scheme.type];
      return (
        <Component
          {...props}
          apiKey={props.auth[props.scheme._key]}
          change={change}
          Input={Input}
        />
      );
    }
    case 'http':
      // TODO support other schemes? https://github.com/readmeio/api-explorer/issues/15
      if (props.scheme.scheme === 'basic') {
        return (
          <Basic
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            change={change}
            Input={Input}
            pass={props.auth[props.scheme._key].pass}
            user={props.auth[props.scheme._key].user}
          />
        );
      }
      if (props.scheme.scheme === 'bearer') {
        return (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Oauth2 {...props} apiKey={props.auth[props.scheme._key]} change={change} Input={Input} />
        );
      }
      break;
    default:
      return null;
  }
}

SecurityInput.propTypes = {
  auth: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
  scheme: PropTypes.shape({
    _key: PropTypes.string.isRequired,
    scheme: PropTypes.string,
    type: PropTypes.string.isRequired,
  }).isRequired,
};

SecurityInput.defaultProps = {
  auth: {},
};

module.exports = SecurityInput;
