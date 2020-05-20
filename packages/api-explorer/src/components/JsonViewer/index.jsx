import React from 'react'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import ReactJson from 'react-json-view'

import colors from '../../colors'

export default function JsonViewer({ schema, missingMessage }) {
  return (
    schema ? <ReactJson
      src={schema}
      collapsed={1}
      collapseStringsAfterLength={100}
      enableClipboard={false}
      name={null}
      displayDataTypes={false}
      displayObjectSize={false}
      style={{
        padding: '20px 10px',
        backgroundColor: colors.jsonViewerBackground,
        fontSize: '12px',
        overflow: 'visible',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
      }}
    /> : <FormattedMessage id={missingMessage} defaultValue={'missing message'} />
  )
}

JsonViewer.propTypes = {
  schema: PropTypes.object.isRequired,
  missingMessage: PropTypes.string.isRequired
}
