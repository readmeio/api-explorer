const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const extensions = require('@readme/oas-extensions');
const AuthBox = require('./AuthBox');
const Oas = require('./lib/Oas');

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
                auth={auth}
                authInputRef={authInputRef}
                needsAuth={needsAuth}
                oauth={oauth}
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

          {oas.servers && oas.servers.length > 0 && (
            <span className="definition-url">
              <span className="url">{oas.url()}</span>
              {splitPath(operation.path).map(part => (
                <span key={part.key} className={`api-${part.type}`}>
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
  auth: PropTypes.shape({}),
  authInputRef: PropTypes.func,
  dirty: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  needsAuth: PropTypes.bool,
  oas: PropTypes.instanceOf(Oas).isRequired,
  oauth: PropTypes.bool.isRequired,
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
