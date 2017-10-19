const React = require('react');
const Cookie = require('js-cookie');
const PropTypes = require('prop-types');

function Oauth2({ apiKey, inputRef, oauthUrl, change }) {
  if (!apiKey && oauthUrl) {
    return (
      <section>
        <div className="text-center">
          <a className="btn btn-primary" href={oauthUrl} target="_self">
            Authenticate via OAuth2
          </a>
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
          <div
            style={{
              display: 'inline-block',
              marginRight: '10px',
              marginTop: '5px',
              fontSize: '13px',
            }}
          >
            Bearer
          </div>
        </div>
        <div className="col-xs-6">
          <input
            ref={inputRef}
            type="text"
            onChange={e => change(e.currentTarget.value)}
            name="apiKey"
          />
        </div>
      </div>
    </section>
  );
}

Oauth2.propTypes = {
  apiKey: PropTypes.string,
  oauthUrl: PropTypes.string,
  change: PropTypes.func.isRequired,
  inputRef: PropTypes.func,
};

Oauth2.defaultProps = {
  apiKey: '',
  oauthUrl: '',
  inputRef: () => {},
};

function ApiKey({ scheme, inputRef, change }) {
  const apiKeyCookie = Cookie.get('api_key');
  // apiKeyCookie = apiKeyCookie || {e => apiKey.change(e.currentTarget.value)};
  return (
    <div className="row">
      <div className="col-xs-5">
        <label htmlFor="apiKey">{scheme.name}</label>
      </div>
      <div className="col-xs-7">
        <input
          ref={inputRef}
          type="text"
          onChange={e => change(e.currentTarget.value)}
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
  inputRef: PropTypes.func,
  change: PropTypes.func.isRequired,
};

ApiKey.defaultProps = {
  inputRef: () => {},
};

class Basic extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: '', password: '' };
    this.inputChange = this.inputChange.bind(this);
  }

  inputChange(name, value) {
    this.setState(
      previousState => {
        return Object.assign({}, previousState, { [name]: value });
      },
      () => {
        this.props.change(this.state);
      },
    );
  }
  render() {
    const { inputRef } = this.props;
    return (
      <div className="row">
        <div className="col-xs-6">
          <label htmlFor="user">username</label>
          <input
            ref={inputRef}
            type="text"
            onChange={e => this.inputChange(e.currentTarget.name, e.currentTarget.value)}
            name="user"
          />
        </div>
        <div className="col-xs-6">
          <label htmlFor="password">password</label>
          <input
            type="text"
            onChange={e => this.inputChange(e.currentTarget.name, e.currentTarget.value)}
            name="password"
          />
        </div>
      </div>
    );
  }
}

Basic.propTypes = {
  change: PropTypes.func.isRequired,
  inputRef: PropTypes.func,
};

Basic.defaultProps = {
  inputRef: () => {},
};

function SecurityInput(props) {
  function change(value) {
    return props.onChange({ auth: { [props.scheme._key]: value } });
  }
  switch (props.scheme.type) {
    case 'oauth2':
      return <Oauth2 {...props} change={change} />;
    case 'http':
      // TODO support other schemes? https://github.com/readmeio/api-explorer/issues/15
      return <Basic {...props} change={change} />;
    case 'apiKey':
      return <ApiKey {...props} change={change} />;
    default:
      return <span />;
  }
}

SecurityInput.propTypes = {
  scheme: PropTypes.shape({
    type: PropTypes.string.isRequired,
    _key: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

module.exports = SecurityInput;
