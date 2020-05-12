import { FormattedMessage } from 'react-intl';
import {Button, Tag} from 'antd'

import colors from './colors'

const React = require('react');
const PropTypes = require('prop-types')
const AuthBox = require('./AuthBox');
const Oas = require('./lib/Oas');

const { Operation } = Oas;

const extensions = require('@mia-platform/oas-extensions');

function splitPath(path) {
  return path
    .split(/({.+?})/)
    .filter(Boolean)
    .map(part => {
      return { type: part.match(/[{}]/) ? 'variable' : 'text', value: part.replace(/[{}]/g, '') };
    });
}

function renderButtonTry(loading, onSubmit, error) {
  return(
    <Button 
      disabled={loading}
      onClick={onSubmit}
      type={error ? 'danger' : 'primary'}
      loading={loading}
    >
      {error ? <FormattedMessage id="error" defaultMessage="Error" /> : <FormattedMessage id="api.try" defaultMessage="Try It" />}
    </Button>
  )
}

function renderOperationMethod(operation) {
  const tagStyle = {
    textTransform: 'uppercase',
    color: colors.defaultTag,
    fontWeight: 600,
  }

  return (
    <Tag 
      color={colors[operation.method] ? colors[operation.method].border: colors.defaultBorder}
      style={tagStyle}
    >
      {operation.method}
    </Tag>
  )
}

function renderUrl(oas, operation) {
  const style = {
    container: {
      color: colors.pathUrl,
      fontSize: 15,
      wordBreak: 'break-all',
      fontFamily: 'monospace',
    },
    baseUrl: {

    },
    text: {},
    variable: {
      color: colors.pathVariable,
      borderBottom: `1px solid ${colors.pathVariableBorder}`
    }
  }

  return (
    oas.servers && oas.servers.length > 0 && (
      <div style={style.container}>
        <span>{oas.url()}</span>
        {splitPath(operation.path).map((part, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`${part.value}-${part.type}-${i}`} style={style[part.type]}>
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
  onChange,
  showAuthBox,
  needsAuth,
  toggleAuth,
  onSubmit,
  oauth,
  auth,
  onReset,
  onVisibleChange,
  showReset,
  error,
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
                onVisibleChange={onVisibleChange}
                needsAuth={needsAuth}
                toggle={toggleAuth}
                authInputRef={authInputRef}
                oauth={oauth}
                auth={auth}
                onReset={onReset}
                showReset={showReset}
                security={operation.security || oas.security}
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
  loading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  toggleAuth: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  showAuthBox: PropTypes.bool,
  needsAuth: PropTypes.bool,
  oauth: PropTypes.bool.isRequired,
  auth: PropTypes.shape({}),
  showReset: PropTypes.bool,
  onReset: PropTypes.func,
  onVisibleChange: PropTypes.func,
  error: PropTypes.bool,
};

PathUrl.defaultProps = {
  showAuthBox: false,
  needsAuth: false,
  authInputRef: () => {},
  auth: {},
  showReset: true,
  error: false,
  onReset: () => {},
  onVisibleChange: () => {},
};
module.exports = PathUrl;
module.exports.splitPath = splitPath;
