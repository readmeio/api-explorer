const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const AuthBox = require('./AuthBox');
const Oas = require('./lib/Oas');

const { Operation } = Oas;

const extensions = require('@readme/oas-extensions');

function splitPath(path) {
  return path
    .split(/({.+?})/)
    .filter(Boolean)
    .map(part => {
      return { type: part.match(/[{}]/) ? 'variable' : 'text', value: part.replace(/[{}]/g, '') };
    });
}
function PathUrl({
  oas,
  operation,
  authInputRef,
  loading,
  dirty,
  onChange,
  showAuthBox,
  needsAuth,
  toggleAuth,
  onSubmit,
  oauth,
  auth,
}) {
  return (
    <div className="api-definition-parent">
      <div className="api-definition">
        <div className="api-definition-container">
          {oas[extensions.EXPLORER_ENABLED] && (
            <div className="api-definition-actions">
              <AuthBox
                operation={operation}
                onChange={onChange}
                onSubmit={onSubmit}
                open={showAuthBox}
                needsAuth={needsAuth}
                toggle={toggleAuth}
                authInputRef={authInputRef}
                oauth={oauth}
                auth={auth}
              />

              <button
                className={classNames('api-try-it-out', { active: dirty })}
                type="submit"
                disabled={loading}
                onClick={onSubmit}
              >
                {!loading && (
                  <span className="try-it-now-btn">
                    <span className="fa fa-compass" />&nbsp;
                    <span>Try It</span>
                  </span>
                )}

                {loading && <i className="fa fa-circle-o-notch fa-spin" />}
              </button>
            </div>
          )}

          <span className={`pg-type-big pg-type type-${operation.method}`}>{operation.method}</span>

          {oas.servers &&
          oas.servers.length > 0 && (
            <span className="definition-url">
              <span className="url">{oas.url()}</span>
              {splitPath(operation.path).map(part => (
                <span key={part.value} className={`api-${part.type}`}>
                  {part.value}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

PathUrl.propTypes = {
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  authInputRef: PropTypes.func,
  dirty: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  toggleAuth: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  showAuthBox: PropTypes.bool,
  needsAuth: PropTypes.bool,
  oauth: PropTypes.bool.isRequired,
  auth: PropTypes.shape({}),
};

PathUrl.defaultProps = {
  showAuthBox: false,
  needsAuth: false,
  authInputRef: () => {},
  auth: {},
};
module.exports = PathUrl;
module.exports.splitPath = splitPath;
