/* eslint-disable react/require-default-props */
import React, {useState} from 'react'
import { FormattedMessage } from 'react-intl'
import {Button} from 'antd'
import PropTypes from 'prop-types'
import ReactJson from 'react-json-view'

import colors from '../../colors'
import CopyButton from './CopyButton'

const collapseButtonStyle = {
  position: 'absolute',
  top: 10,
  right: 10,
  display: 'grid',
  gridAutoFlow: 'column',
  gridGap: 10
}

const COLLAPSED_LEVEL = 1
const EXPANDED_LEVEL = 10

export default function JsonViewer({ schema, missingMessage }) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  if (!schema) {
    return  <FormattedMessage id={missingMessage} defaultValue={'missing schema'} />
  }

  return (
    <div style={{position: 'relative'}}>
      <ReactJson
        src={schema}
        collapsed={isCollapsed ? COLLAPSED_LEVEL : EXPANDED_LEVEL}
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
      <div style={collapseButtonStyle} >
        <CopyButton schema={schema} /> 
        <Button onClick={() => setIsCollapsed(!isCollapsed)}>
          <FormattedMessage id={`schemas.${isCollapsed ? 'expand' : 'collapse'}`} />
        </Button>
      </div>
    </div>
  )
}

JsonViewer.propTypes = {
  schema: PropTypes.object,
  missingMessage: PropTypes.string.isRequired
}
