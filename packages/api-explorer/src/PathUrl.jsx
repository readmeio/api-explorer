const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const extensions = require('@readme/oas-extensions');
const Oas = require('oas/tooling');

const AuthBox = require('./AuthBox');
const { Button } = require('@readme/ui/.bundles/es/ui/components');

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
  resetForm,
  showAuthBox,
  toggleAuth,
  validationErrors,
}) {
  const explorerEnabled = extensions.getExtension(extensions.EXPLORER_ENABLED, oas, operation);

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
                disabled={loading || validationErrors.json}
                onClick={onSubmit}
                type="submit"
              >
                {!loading && (
                  <span className="try-it-now-btn">
                    {validationErrors.json ? (
                      <i className="fa fa-times-circle api-try-it-out-errorIcon" />
                    ) : (
                      <span className="fa fa-compass" />
                    )}
                    &nbsp;
                    <span>Try It</span>
                  </span>
                )}

                {loading && <i className="fa fa-circle-o-notch fa-spin" />}

                {validationErrors.json && (
                  <section className="api-try-it-out-popover">
                    <h1 className="api-try-it-out-popover-h1">Invalid Request</h1>
                    <div className="api-try-it-out-popover-description">Check your body parameters and try again.</div>
                    <div
                      className="Button Button_red Button_md"
                      onClick={resetForm}
                      onKeyDown={resetForm}
                      role="button"
                      tabIndex="0"
                    >
                      Reset Parameters
                    </div>
                  </section>
                )}
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
  explorerEnabled: PropTypes.bool,
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
  resetForm: PropTypes.func.isRequired,
  showAuthBox: PropTypes.bool,
  showValidationErrors: PropTypes.bool,
  toggleAuth: PropTypes.func.isRequired,
  validationErrors: PropTypes.shape({
    form: PropTypes.bool,
    json: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
};

PathUrl.defaultProps = {
  auth: {},
  authInputRef: () => {},
  needsAuth: false,
  showAuthBox: false,
  showValidationErrors: false,
};

module.exports = PathUrl;
module.exports.splitPath = splitPath;
