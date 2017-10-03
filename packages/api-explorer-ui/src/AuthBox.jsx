const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const SecurityInput = require('./SecurityInput');
const { Operation } = require('./lib/Oas');

function renderSecurities(operation, onChange, onSubmit) {
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
              <SecurityInput key={security._key} scheme={security} apiKey="" onChange={onChange} />
            ))}
          </section>
        </div>
      </form>
    );
  });
}

// eslint-disable-next-line react/prefer-stateless-function
class AuthBox extends React.Component {
  render() {
    const { operation } = this.props;

    if (!operation.hasAuth()) return null;

    return (
      <div
        className={classNames('hub-auth-dropdown', 'simple-dropdown', { open: this.props.open })}
      >
        {
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a href="" className="icon icon-user-lock" onClick={this.props.toggle} />
        }
        <div className="nopad">
          <div className="triangle" />
          <div>
            {renderSecurities(operation, this.props.onChange, e => {
              e.preventDefault();
              this.props.onSubmit();
            })}
          </div>
          <div className={classNames('hub-authrequired', { active: this.props.needsAuth })}>
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
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  needsAuth: PropTypes.bool,
  open: PropTypes.bool,
};

AuthBox.defaultProps = {
  needsAuth: false,
  open: false,
};

module.exports = AuthBox;
