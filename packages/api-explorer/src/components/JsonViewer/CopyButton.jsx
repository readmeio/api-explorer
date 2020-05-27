import React from 'react'
import PropTypes from 'prop-types'
import {Button} from 'antd'
import {FormattedMessage} from 'react-intl'

import CopyText from '../CopyText'

function stringify (schema) {
    try {
      return JSON.stringify(schema)
    } catch(err) {
      return null
    }
}

export default function CopyButton ({schema}) {
    const stringifiedSchema = stringify(schema)

    if (!stringifiedSchema) {
        return null
    }

    return (
      <CopyText text={stringifiedSchema}>
        {({isCopied}) => (
          <Button>
            {isCopied ?
              <FormattedMessage id="code.copied" defaultMessage="Copied" /> :
              <FormattedMessage id="code.copy" defaultMessage="Copy" />
            }
          </Button>
        )}
      </CopyText>
    )
}

CopyButton.propTypes = {
  schema: PropTypes.object.isRequired,
};
