import React, {Component, Fragment} from 'react'
import {Icon, Popover, Alert, Tabs, Button} from 'antd'

const PropTypes = require('prop-types');
const SecurityInput = require('./SecurityInput')

const TabPane = Tabs.TabPane

function getSecurityTabs(securityTypes, config, onChange,onSubmit) {
  const {authInputRef, oauth, auth} = config
  return Object.keys(securityTypes).map((type, index) => {
    const securities = securityTypes[type];
    return (
      // eslint-disable-next-line react/no-array-index-key
      <TabPane tab={type} key={`security-${index}`} >
        <form onSubmit={onSubmit}>
          <div style={{padding: '15px 17px'}}>
            <section>
              {securities.map(security => (
                <SecurityInput
                  {...{ auth, onChange, authInputRef, oauth }}
                  key={security._key}
                  scheme={security}
                />
            ))}
            </section>
          </div>
        </form>
      </TabPane>
    );
  });
}

// eslint-disable-next-line react/prefer-stateless-function
class AuthBox extends Component {
  
  renderIconLock(){
    const {toggle, open} = this.props
    return(
      <Icon type={open ? 'unlock' : 'lock'} onClick={toggle} />
    )
  }
  
  renderAuthAlert(){
    const {needsAuth} = this.props
    return(
      needsAuth ? 
        <Alert
          message="Warning"
          description="Authentication is required for this endpoint"
          type="warning"
          showIcon
        /> : 
      null
    )
  }

  renderSecurityBox(){
    const {
      securityTypes,
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
        <Tabs defaultActiveKey={'security-0'}>
          {
            getSecurityTabs(
              securityTypes,
              { authInputRef, oauth, auth },
              onChange,
              e => {
                e.preventDefault();
                onSubmit();
              }
            )
          }
        </Tabs>

        {
          showReset ? 
            <div style={{padding: 5}}>
              <Button 
                onClick={onReset}
                type={'danger'}
                size={'small'}
              >
                Reset
              </Button>
            </div>
          : null
        }
        {this.renderAuthAlert()}
      </Fragment>
    )
  }

  render() {
    const {securityTypes} = this.props
    if (Object.keys(securityTypes).length === 0) return null;
    
    return (
      <Popover
        content={this.renderSecurityBox()}
        style={{padding: 0}}
        trigger={'click'}
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
  showReset: PropTypes.bool
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
};

module.exports = AuthBox;
