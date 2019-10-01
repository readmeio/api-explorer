const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const SecurityInput = require('./SecurityInput');
const { Operation } = require('./lib/Oas');

function Securities({ authInputRef, operation, onChange, oauth, auth, onSubmit }) {
  const securityTypes = operation.prepareSecurity();
  return Object.keys(securityTypes).map(type => {
    const securities = securityTypes[type];
    return (
      <form key={type} onSubmit={onSubmit}>
        <h3>{`${type} Auth`}</h3>
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
                auth={auth}
                onChange={onChange}
                authInputRef={authInputRef}
                oauth={oauth}
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

function AuthBox({
  authInputRef,
  operation,
  onSubmit,
  onChange,
  open,
  needsAuth,
  toggle,
  oauth,
  auth,
}) {
  if (Object.keys(operation.prepareSecurity()).length === 0) return null;

  return (
    <div className={classNames('hub-auth-dropdown', 'simple-dropdown', { open })}>
      {
        // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label, jsx-a11y/anchor-is-valid
        <a href="#" className="icon icon-user-lock" onClick={toggle} />
      }
      <div className="nopad">
        <div className="triangle" />
        <div>
          <Securities
            authInputRef={authInputRef}
            operation={operation}
            oauth={oauth}
            auth={auth}
            onChange={onChange}
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

AuthBox.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
  authInputRef: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  needsAuth: PropTypes.bool,
  open: PropTypes.bool,
  oauth: PropTypes.bool.isRequired,
  auth: PropTypes.shape({}),
};

AuthBox.defaultProps = {
  needsAuth: false,
  open: false,
  authInputRef: () => {},
  auth: {},
};

module.exports = AuthBox;
