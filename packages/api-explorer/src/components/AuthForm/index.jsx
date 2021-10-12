import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Divider} from 'antd'
import debounce from 'lodash.debounce'
import pick from 'lodash.pick'
import {omit} from 'ramda'

const SecurityInput = require('../../SecurityInput')

const styles = {
  container: {
    display: 'grid',
    gridTemplateRows: 'repeat(auto-fit, minmax(50px, 1fr))'
  },
  input: {
    margin: '10px'
  },
  inputsContainer: {
    paddingTop: 10
  },
  schemeName: {
    fontSize: 16
  }
}

function omitOrMerge (current, value, key) {
  if (!value) {
    return omit([key], current)
  }

  return {
    ...current,
    [key]: value
  }
}

function getSecuritySections(securityTypes, config, onChange, onSubmit, schemeName) {
  const {authInputRef, oauth, auth} = config
  return (
    <form 
      onSubmit={e => {
        e.preventDefault() 
        onSubmit()
      }}
    >
      {
        Object.entries(securityTypes).map(([type, securities], index) => (
          <section key={`security-${type + index}`}>
            {
              securities.map(security => (
                <div key={security._key} style={styles.input}>
                  <SecurityInput
                    {...{ auth, onChange, authInputRef, oauth }}
                    scheme={security}
                    schemeName={schemeName}
                  />
                </div>
              ))
            }
          </section>
        ))
      }
    </form>
  )
}

class AuthForm extends Component {
  constructor (props) {
    super(props)
    this.onChangeDebounced = debounce(this.onChange, 200)
    this.state = {auth: {}}
  }

  onChange (value, schemeName) {
    const {onChange} = this.props
    const mergeAuths = omitOrMerge(this.state.auth, value, schemeName)
    this.setState({
      auth: mergeAuths
    })
    onChange(mergeAuths)
  }

  render () {
    const {securitySchemes, onChange, auth, oauth, authInputRef, onSubmit} = this.props
    const schemeKeys = Object.keys(securitySchemes)

    return (
      <div style={styles.container}>
        {
            schemeKeys.map((schemeName, index) => {
              return (
                <div key={`field-${schemeName}`}>
                  <span style={styles.schemeName}>{schemeName}</span>
                  <div style={styles.inputsContainer}>
                    {
                      getSecuritySections(
                        pick(securitySchemes, schemeName),
                        { authInputRef, oauth, auth },
                        onChange,
                        onSubmit,
                        schemeName
                      )
                    }
                  </div>
                  {index < schemeKeys.length - 1 ?
                    <Divider /> :
                    null
                  }
                </div>
              )
            })
          }
      </div>
    )
  }
}
AuthForm.propTypes = {
  auth: PropTypes.object,
  authInputRef: PropTypes.func,
  oauth: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  securitySchemes: PropTypes.object
}
AuthForm.defaultProps = {
  authInputRef: () => {},
  auth: {},
  oauth: {},
  securitySchemes: {}
}

module.exports = AuthForm;
