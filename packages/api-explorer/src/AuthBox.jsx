import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types';
import {injectIntl, FormattedMessage, intlShape} from 'react-intl';
import {Icon, Popover, Alert, Button} from 'antd'
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
    const {toggle, open} = this.props
    return(
      <Icon type={open ? 'unlock' : 'lock'} onClick={toggle} />
    )
  }

  renderAuthAlert() {
    const {needsAuth, intl} = this.props

    const message = intl.formatMessage({id:'warning', defaultMessage: 'Warning'})
    const description = intl.formatMessage({id:'api.auth.required', defaultMessage: 'Authentication is required for this endpoint'})
    return(
      needsAuth ?
        <Alert
          message={message}
          description={description}
          type="warning"
          showIcon
        /> :
      null
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
      authInputRef,
      showReset,
      onReset
    } = this.props

    return(
      <Fragment>
        <AuthForm 
          onChange={onChange}
          onSubmit={onSubmit} 
          authInputRef={authInputRef}
          auth={auth}
          oauth={oauth}
          securitySchemes={security ? filterSecurityScheme(security,securityTypes) : {}} 
        />
        {
          showReset ?
            <div style={{padding: 5}}>
              <Button
                onClick={onReset}
                type={'danger'}
                size={'small'}
              >
                <FormattedMessage
                  id="reset"
                  defaultMessage="Reset"
                />
              </Button>
            </div>
          : null
        }
        {this.renderAuthAlert()}
      </Fragment>
    )
  }

  render() {
    const {securityTypes, onVisibleChange} = this.props
    if (Object.keys(securityTypes).length === 0) return null;

    return (
      <Popover
        content={this.renderSecurityBox()}
        style={{padding: 0}}
        trigger={'click'}
        visible={this.props.open}
        onVisibleChange={(visibility) => {
          onVisibleChange(visibility)
        }}
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
  intl: intlShape.isRequired,
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
