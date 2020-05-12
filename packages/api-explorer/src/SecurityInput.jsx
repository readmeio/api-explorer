import colors from './colors'

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

// eslint-disable-next-line react/prefer-stateless-function
class Input extends React.Component {
  render() {
    const style = {
      border: `1px solid ${colors.inputBorder}`,
      borderRadius: 2,
      padding: '5px 7px',
      width: '100%',
      fontSize: '13px',
      color: colors.inputColor,
      minWidth: 100
    }
    return (
      <DebounceInput
        {...this.props}
        minLength={0}
        style={style}
        debounceTimeout={process.env.NODE_ENV === 'test' ? 0 : 300}
      />
    );
  }
}

function SecurityInput(props) {
  const {auth, scheme} = props
  function change(value) {
    return props.onChange({ [scheme._key]: value });
  }

  switch (scheme.type) {
    case 'apiKey':
    case 'oauth2': {
      const Component = types[scheme.type];
      return (
        <Component
          {...props}
          apiKey={auth[scheme._key]}
          change={change}
          Input={Input}
        />
      );
    }
    case 'http':
      if (scheme.scheme === 'basic') {
        return (
          <Basic
            {...props}
            change={change}
            user={auth[scheme._key].user}
            pass={auth[scheme._key].pass}
            Input={Input}
          />
        );
      }
      if (scheme.scheme === 'bearer') {
        return (
          <Oauth2 {...props} apiKey={auth[scheme._key]} change={change} Input={Input} />
        );
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
