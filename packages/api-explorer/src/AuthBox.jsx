import React, {Component} from 'react'
import PropTypes from 'prop-types';
import {FormattedMessage, injectIntl} from 'react-intl';
import {Alert, Button, Icon, Popover} from 'antd'
import flatten from 'lodash.flatten'
import uniq from 'lodash.uniq'

import AuthForm from './components/AuthForm';

function filterSecurityScheme(security, securitySchemes) {
  const securities = uniq(flatten(security.map(elem => Object.keys(elem))))
  const newSecurityScheme = {}
  for (const securityType of Object.keys(securitySchemes)) {
    for (const elem of uniq(securitySchemes[securityType])) {
      if (!securities.includes(elem._key)) {
        continue
      }

      if (!newSecurityScheme[securityType]) {
        newSecurityScheme[securityType] = []
      }

      newSecurityScheme[securityType].push(elem)
    }
  }
  return newSecurityScheme
}

class AuthBox extends Component {
  
  renderIconLock() {
    const { toggle, open } = this.props
    
    return (
      <Icon
        type={open ? 'unlock' : 'lock'}
        onClick={toggle}
      />
    )
  }

  renderAuthAlert() {
    const { needsAuth } = this.props
    
    const message = (
      <FormattedMessage
        id='warning'
        defaultMessage='Warning'
      />
    )

    const description = (
      <FormattedMessage
        id='api.auth.required'
        defaultMessage='Authentication is required for this endpoint'
      />
    )
    
    return( needsAuth ?
      <Alert
        message={message}
        description={description}
        type="warning"
        showIcon
        style={{marginBottom: '20px'}}
      /> :
      null
    )
  }

  renderResetButton() {
    const {showReset, onReset} = this.props

    return (
      <Button
        disabled={!showReset}
        ghost
        onClick={onReset}
        style={{marginTop: '20px', width: '100%'}}
        type={'danger'}
      >
        <FormattedMessage id="reset" defaultMessage="Reset" />
      </Button>
    )
  }

  renderSecurityBox() {
    const {
      securityTypes,
      security,
      onSubmit,
      onChange,
      oauth,
      auth,
      authInputRef
    } = this.props

    return (
      <>
        {this.renderAuthAlert()}
        <AuthForm 
          onChange={onChange}
          onSubmit={onSubmit} 
          authInputRef={authInputRef}
          auth={auth}
          oauth={oauth}
          securitySchemes={security ?
            filterSecurityScheme(security, securityTypes) :
            {}
          }
        />
        {this.renderResetButton()}

      </>
    )
  }

  render() {
    const { securityTypes, onVisibleChange } = this.props
    
    if (Object.keys(securityTypes).length === 0) return null;

    return (
      <Popover
        content={this.renderSecurityBox()}
        getPopupContainer={triggerNode => triggerNode}
        style={{padding: 0}}
        trigger={'click'}
        visible={this.props.open}
        onVisibleChange={visibility => onVisibleChange(visibility)}
      >
        {this.renderIconLock()}
      </Popover>
    )
  }
}

const oauth2Types = PropTypes.shape({
  OAuth2: PropTypes.arrayOf(PropTypes.shape({
    _key: PropTypes.string,
    type: PropTypes.string
  }))
})

const basicTypes = PropTypes.shape({
  Basic: PropTypes.arrayOf(PropTypes.shape({
    _key: PropTypes.string,
    scheme: PropTypes.string,
    type: PropTypes.string
  }))
})

const apikeyTypes = PropTypes.shape({
  Query: PropTypes.arrayOf(PropTypes.shape({
    _key: PropTypes.string,
    in: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string
  }))
})

AuthBox.propTypes = {
  securityTypes: PropTypes.oneOfType([
      oauth2Types,
      basicTypes,
      apikeyTypes,
      PropTypes.shape({})
  ]),
  authInputRef: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  toggle: PropTypes.func.isRequired,
  needsAuth: PropTypes.bool,
  open: PropTypes.bool,
  oauth: PropTypes.bool.isRequired,
  auth: PropTypes.shape({}),
  onReset: PropTypes.func,
  showReset: PropTypes.bool,
  onVisibleChange: PropTypes.func,
  security: PropTypes.arrayOf(PropTypes.object)
};

AuthBox.defaultProps = {
  needsAuth: false,
  open: false,
  authInputRef: () => {},
  auth: {},
  onSubmit: () => {},
  onReset: () => {},
  showReset: true,
  securityTypes: {},
  onVisibleChange: () => {},
  security: [],
};

module.exports = injectIntl(AuthBox);
