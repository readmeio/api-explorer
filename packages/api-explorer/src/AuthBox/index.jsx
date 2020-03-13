require('./style.scss');

const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const { Operation } = require('@readme/oas-tooling');

const SecurityInput = require('../SecurityInput');

function GroupsList({ group, groups, onAuthGroupChange }) {
  function onSelect({ target }) {
    onAuthGroupChange(target.value);
  }

  if (!groups || (groups && groups.length <= 1)) {
    return false;
  }

  return (
    <select onChange={onSelect} value={group}>
      {groups.map(item => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}

function Securities({ auth, authInputRef, group, groups, oauth, onChange, onAuthGroupChange, onSubmit, operation }) {
  const securityTypes = operation.prepareSecurity();
  return (
    <div className="AuthBox">
      {groups && groups.length > 1 && (
        <div className="GroupsList">
          <GroupsList group={group} groups={groups} onAuthGroupChange={onAuthGroupChange} />
        </div>
      )}
      {Object.keys(securityTypes).map(type => {
        const securities = securityTypes[type];
        return (
          <details key={type} open>
            <summary>
              <h3>{`${type} Auth`}</h3>
            </summary>
            <form className="pad" onSubmit={onSubmit}>
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
            </form>
          </details>
        );
      })}
    </div>
  );
}

function AuthBox({
  auth,
  authInputRef,
  group,
  groups,
  needsAuth,
  oauth,
  onChange,
  onAuthGroupChange,
  onSubmit,
  open,
  operation,
  toggle,
}) {
  if (Object.keys(operation.prepareSecurity()).length === 0) return null;

  return (
    <div className={classNames('hub-auth-dropdown', 'simple-dropdown', { open })}>
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid */}
      <a className="icon icon-user-lock" href="#" onClick={toggle} />

      <div className="nopad">
        <div className="triangle" />
        <div>
          <Securities
            auth={auth}
            authInputRef={authInputRef}
            group={group}
            groups={groups}
            oauth={oauth}
            onAuthGroupChange={onAuthGroupChange}
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

const commonProps = {
  group: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  onAuthGroupChange: PropTypes.func.isRequired,
};

GroupsList.propTypes = {
  ...commonProps,
};

AuthBox.propTypes = {
  ...commonProps,
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

Securities.propTypes = { ...AuthBox.propTypes };
Securities.defaultProps = { ...AuthBox.defaultProps };

// `props.toggle` is not used in Securities, and passing it through as a required prop throws errors in dev.
delete Securities.propTypes.toggle;

module.exports = AuthBox;
