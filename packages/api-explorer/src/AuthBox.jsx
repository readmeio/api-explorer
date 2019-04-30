import React, {Component, Fragment} from 'react'
import {Icon, Popover, Alert, Tabs} from 'antd'

const {TabPane} = Tabs

const PropTypes = require('prop-types');
const SecurityInput = require('./SecurityInput');
const { Operation } = require('./lib/Oas');

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
      operation,
      onSubmit,
      onChange,
      oauth,
      auth,
      authInputRef
    } = this.props
    const securityTypes = operation.prepareSecurity();
    return(
      <Fragment>
        <Tabs defaultActiveKey={'security-0'}>
          {
            getSecurityTabs(
              securityTypes,
              { authInputRef, operation, oauth, auth },
              onChange,
              e => {
                e.preventDefault();
                onSubmit();
              }
            )
          }
        
        </Tabs>
        {this.renderAuthAlert()}
      </Fragment>
    )
  }

  render() {
    const {operation} = this.props

    if (Object.keys(operation.prepareSecurity()).length === 0) return null;
    
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

AuthBox.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
  authInputRef: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  needsAuth: PropTypes.bool,
  open: PropTypes.bool,
  oauth: PropTypes.bool.isRequired,
  auth: PropTypes.shape({}),
};

AuthBox.defaultProps = {
  needsAuth: false,
  open: false,
  authInputRef: () => {},
  auth: {},
};

module.exports = AuthBox;
