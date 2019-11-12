const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const { Operation } = require('oas');

const SecurityInput = require('./SecurityInput');

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
                key={security._key}
                auth={auth}
                authInputRef={authInputRef}
                oauth={oauth}
                onChange={onChange}
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
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label, jsx-a11y/anchor-is-valid */}
      <a className="icon icon-user-lock" href="#" onClick={toggle} />

      <div className="nopad">
        <div className="triangle" />
        <div>
          <Securities
            auth={auth}
            authInputRef={authInputRef}
            oauth={oauth}
            onChange={onChange}
            onSubmit={e => {
              e.preventDefault();
              onSubmit();
            }}
            operation={operation}
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
  auth: PropTypes.shape({}),
  authInputRef: PropTypes.func,
  needsAuth: PropTypes.bool,
  oauth: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool,
  operation: PropTypes.instanceOf(Operation).isRequired,
  toggle: PropTypes.func.isRequired,
};

AuthBox.defaultProps = {
  auth: {},
  authInputRef: () => {},
  needsAuth: false,
  open: false,
};

module.exports = AuthBox;
