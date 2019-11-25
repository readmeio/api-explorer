const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const { Operation } = require('oas');

const SecurityInput = require('./SecurityInput');

function GroupsList({ group, groups, onGroupChange }) {
  function onSelect({ target }) {
    onGroupChange(target.value, target.options[target.selectedIndex].text);
  }

  if (!groups || (groups && groups.length <= 1)) {
    return false;
  }

  return (
    <select onChange={onSelect} style={{ float: 'right' }} value={group}>
      {groups.map(item => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}

function Securities({
  auth,
  authInputRef,
  group,
  groups,
  oauth,
  onChange,
  onGroupChange,
  onSubmit,
  operation,
}) {
  const securityTypes = operation.prepareSecurity();
  return Object.keys(securityTypes).map((type, idx) => {
    const securities = securityTypes[type];
    return (
      <form key={type} onSubmit={onSubmit}>
        <h3>
          {`${type} Auth`}
          {/* Only show the groups list for the first security (assuming there are multiple). */}
          {idx === 0 && <GroupsList group={group} groups={groups} onGroupChange={onGroupChange} />}
        </h3>
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
  auth,
  authInputRef,
  group,
  groups,
  needsAuth,
  oauth,
  onChange,
  onGroupChange,
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
            onChange={onChange}
            onGroupChange={onGroupChange}
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
    }),
  ),
  onGroupChange: PropTypes.func.isRequired,
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

module.exports = AuthBox;
