const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const SecurityInput = require('./SecurityInput');
const { Operation } = require('./lib/Oas');

function Securities({ authInputRef, operation, onChange, oauth, apiKey, onSubmit }) {
  const securityTypes = operation.prepareSecurity();
  return Object.keys(securityTypes).map(type => {
    const securities = securityTypes[type];
    return (
      <form key={type} onSubmit={onSubmit}>
        <h3>{type} Auth</h3>
        <div className="pad">
          <section>
            {
              // https://github.com/readmeio/api-explorer/issues/20
              // (type === 'OAuth2' && securities.length > 1) && (
              //   <select>
              //     {
              //       securities.map(security =>
              //         <option key={security._key} value={security._key}>{security._key}</option>,
              //       )
              //     }
              //   </select>
              // )
            }
            {securities.map(security => (
              <SecurityInput
                {...{ apiKey, onChange, authInputRef, oauth }}
                key={security._key}
                scheme={security}
              />
            ))}
          </section>
        </div>
      </form>
    );
  });
}

class AuthBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onChange = this.onChange.bind(this);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.auth !== this.state.auth) this.props.onChange({ auth: this.state.auth });
  }
  onChange(auth) {
    this.setState(previousState => {
      return {
        auth: Object.assign({}, previousState.auth, auth),
      };
    });
  }
  render() {
    const {
      authInputRef,
      operation,
      onSubmit,
      open,
      needsAuth,
      toggle,
      oauth,
      apiKey,
    } = this.props;

    if (Object.keys(operation.prepareSecurity()).length === 0) return null;

    return (
      <div className={classNames('hub-auth-dropdown', 'simple-dropdown', { open })}>
        {
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a href="" className="icon icon-user-lock" onClick={toggle} />
        }
        <div className="nopad">
          <div className="triangle" />
          <div>
            <Securities
              {...{ authInputRef, operation, oauth, apiKey }}
              onChange={this.onChange}
              onSubmit={e => {
                e.preventDefault();
                onSubmit();
              }}
            />
          </div>
          <div className={classNames('hub-authrequired', { active: needsAuth })}>
            <div className="hub-authrequired-slider">
              <i className="icon icon-notification" />
              Authentication is required for this endpoint
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AuthBox.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
  authInputRef: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  needsAuth: PropTypes.bool,
  open: PropTypes.bool,
  oauth: PropTypes.bool.isRequired,
  apiKey: PropTypes.string,
};

AuthBox.defaultProps = {
  needsAuth: false,
  open: false,
  authInputRef: () => {},
  apiKey: '',
};

module.exports = AuthBox;
