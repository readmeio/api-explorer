import {Button, Tag} from 'antd'

import colors from './colors'

const React = require('react');
const PropTypes = require('prop-types')
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

function renderButtonTry(loading, onSubmit, error){
  return(
    <Button 
      disabled={loading}
      onClick={onSubmit}
      type={error ? 'danger' : 'primary'}
      loading={loading}
    >
      {error ? 'Error' : 'Try It'}
    </Button>
  )
}
function renderOperationMethod(operation){
  return(
    <Tag color={colors[operation.method]}>{operation.method}</Tag>
  )
}

function renderUrl(oas, operation){
  const style = {
    container: {
      color: colors.pathUrl,
      fontSize: 15,
      wordBreak: 'break-all'
    },
    baseUrl: {

    },
    text: {},
    variable: {
      color: colors.pathVariable,
      borderBottom: `1px solid ${colors.pathVariableBorder}`
    }
  }
  return(
    oas.servers &&
      oas.servers.length > 0 && (
        <div style={style.container}>
          <span>{oas.url()}</span>
          {splitPath(operation.path).map(part => (
            <span key={part.value} style={style[part.type]}>
              {part.value}
            </span>
          ))}
        </div>
      )
  )
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
  onReset,
  showReset,
  error
}) {
  const containerStyle = {
    background: colors.pathUrlBackground,
    padding: '8px 18px',
    borderRadius: 10,
    boxShadow:  `0 1px 0 ${colors.pathUrlShadow}`,
    color: colors.pathUrl
  }
  return (
    <div style={containerStyle}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
  
        <div style={{display: 'flex'}}>
          {renderOperationMethod(operation)}

          {renderUrl(oas, operation)}
        </div>
          
        {oas[extensions.EXPLORER_ENABLED] && (
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{marginRight: 10}}>
              <AuthBox
                securityTypes={operation.prepareSecurity()}
                onChange={onChange}
                onSubmit={onSubmit}
                open={showAuthBox}
                needsAuth={needsAuth}
                toggle={toggleAuth}
                authInputRef={authInputRef}
                oauth={oauth}
                auth={auth}
                onReset={onReset}
                showReset={false}
              />
            </div>

            {renderButtonTry(loading, onSubmit, error)}
          </div>
          )}

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
  showReset: PropTypes.bool,
  error: PropTypes.bool
};

PathUrl.defaultProps = {
  showAuthBox: false,
  needsAuth: false,
  authInputRef: () => {},
  auth: {},
  showReset: true,
  error: false
};
module.exports = PathUrl;
module.exports.splitPath = splitPath;
