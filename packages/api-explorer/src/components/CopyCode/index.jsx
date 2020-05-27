import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'

import CopyText from '../CopyText'
import './style.css'


export default function CopyCode({code}) {
    return (
      <CopyText className="mia-ctc-button" text={code}>
        {({isCopied}) => (
          <span>
            {isCopied ?
              <span><FormattedMessage id="code.copied" defaultMessage="Copied" /></span> :
              <span><FormattedMessage id="code.copy" defaultMessage="Copy" /></span>
          }
          </span>
        )}
        
      </CopyText>
    )
}

CopyCode.propTypes = {
  code: PropTypes.string.isRequired,
};
