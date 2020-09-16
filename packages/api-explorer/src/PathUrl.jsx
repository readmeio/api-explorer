const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const Oas = require('@readme/oas-tooling');

const AuthBox = require('./AuthBox');

const { Operation } = Oas;

function splitPath(path) {
  return path
    .split(/({.+?})/)
    .filter(Boolean)
    .map((part, i) => {
      return {
        type: part.match(/[{}]/) ? 'variable' : 'text',
        value: part.replace(/[{}]/g, ''),
        // To ensure unique keys, we're going to create a key
        // with the value concatenated to its index.
        key: `${part.replace(/[{}]/g, '')}-${i}`,
      };
    });
}

function PathUrl({
  auth,
  authInputRef,
  dirty,
  loading,
  group,
  groups,
  needsAuth,
  oas,
  oauth,
  onAuthGroupChange,
  onChange,
  onSubmit,
  operation,
  showAuthBox,
  toggleAuth,
  explorerEnabled,
}) {
  return (
    <div className="api-definition-parent">
      <div className="api-definition">
        <div className="api-definition-container">
          {explorerEnabled && (
            <div className="api-definition-actions">
              <AuthBox
                auth={auth}
                authInputRef={authInputRef}
                group={group}
                groups={groups}
                needsAuth={needsAuth}
                oauth={oauth}
                onAuthGroupChange={onAuthGroupChange}
                onChange={onChange}
                onSubmit={onSubmit}
                open={showAuthBox}
                operation={operation}
                toggle={toggleAuth}
              />

              <button
                className={classNames('api-try-it-out', { active: dirty })}
                disabled={loading}
                onClick={onSubmit}
                type="submit"
              >
                {!loading && (
                  <span className="try-it-now-btn">
                    <span className="fa fa-compass" />
                    &nbsp;
                    <span>Try It</span>
                  </span>
                )}

                {loading && <i className="fa fa-circle-o-notch fa-spin" />}
              </button>
            </div>
          )}

          <span className={`pg-type-big pg-type type-${operation.method}`}>{operation.method}</span>
          <span className="definition-url">
            <span className="url">{oas.url()}</span>
            {splitPath(operation.path).map(part => (
              <span key={part.key} className={`api-${part.type}`}>
                {part.value}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

PathUrl.propTypes = {
  auth: PropTypes.shape({}),
  authInputRef: PropTypes.func,
  dirty: PropTypes.bool.isRequired,
  explorerEnabled: PropTypes.bool.isRequired,
  group: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  loading: PropTypes.bool.isRequired,
  needsAuth: PropTypes.bool,
  oas: PropTypes.instanceOf(Oas).isRequired,
  oauth: PropTypes.bool.isRequired,
  onAuthGroupChange: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  showAuthBox: PropTypes.bool,
  toggleAuth: PropTypes.func.isRequired,
};

PathUrl.defaultProps = {
  auth: {},
  authInputRef: () => {},
  needsAuth: false,
  showAuthBox: false,
};

module.exports = PathUrl;
module.exports.splitPath = splitPath;
