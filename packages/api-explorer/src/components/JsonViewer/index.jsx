/* eslint-disable react/require-default-props */
import React, {useState} from 'react'
import { FormattedMessage } from 'react-intl'
import {Button} from 'antd'
import PropTypes from 'prop-types'
import ReactJson from 'react-json-view'

import colors from '../../colors'

const collapseButtonStyle = {
  position: 'absolute',
  top: 10,
  right: 10
}

export default function JsonViewer({ schema, missingMessage }) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  if (!schema) {
    return  <FormattedMessage id={missingMessage} defaultValue={'missing schema'} />
  }

  return (
    <div style={{position: 'relative'}}>
      <ReactJson
        src={schema}
        collapsed={isCollapsed ? 1 : 5}
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
      />
      <Button style={collapseButtonStyle} onClick={() => setIsCollapsed(!isCollapsed)}>
        <FormattedMessage id={`schemas.${isCollapsed ? 'expand' : 'collapse'}`} />
      </Button>
    </div>
  )
}

JsonViewer.propTypes = {
  schema: PropTypes.object,
  missingMessage: PropTypes.string.isRequired
}
