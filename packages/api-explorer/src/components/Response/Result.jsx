import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'
import {Button, Icon} from 'antd'

import colors from '../../colors'
import {notJsonStyle} from './style'

const syntaxHighlighter = require('@mia-platform/syntax-highlighter');
const ReactJson = require('react-json-view').default;
const contentTypeIsJson = require('../../lib/content-type-is-json');

const FileSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="41" height="53" viewBox="0 0 41 53">
    <path fill="#D1D1D1" fillRule="evenodd" d="M39.67 13.85L27.14 1.41a2.015 2.015 0 0 0-1.42-.587H2.012A2.003 2.003 0 0 0 0 2.82v47.961c0 1.106.9 1.999 2.012 1.999H38.25a2.003 2.003 0 0 0 2.012-1.999V15.267c0-.53-.214-1.043-.591-1.417zm-2.048 1.335H25.789V3.432l11.833 11.753zm.113 35.099H2.527V3.319h20.987v11.49a2.632 2.632 0 0 0 2.64 2.623h11.58v32.852zM19.628 33.422H8.059c-.276 0-.503.112-.503.25v1.5c0 .137.227.25.503.25h11.569c.277 0 .503-.113.503-.25v-1.5c0-.138-.226-.25-.503-.25zM7.556 25.178v1.5c0 .138.227.25.503.25h24.143c.277 0 .503-.112.503-.25v-1.5c0-.137-.226-.25-.503-.25H8.06c-.276 0-.503.113-.503.25z" />
  </svg>
)

export default function Result({result, isCollapse}) {
  const isJson =
    result.type && contentTypeIsJson(result.type) && typeof result.responseBody === 'object';

  return (
    <div>
      {result.isBinary && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{padding: 8}}>
            {FileSvg}
          </div>
          <span style={{color: '#fff'}}>
            <FormattedMessage
              id="api.response.binary"
              defaultMessage="A {typeFile} was returned. Download file to view it"
              values={{typeFile: result.type}}
            />
          </span>
          <div style={{padding: 8}}>
            <Button type={'primary'} onClick={() => window.open(result.responseBody)}>
              <Icon type="download" />
              <FormattedMessage id="code.download" defaultMessage="Download" />
            </Button>
          </div>
        </div>
      )}

      {!result.isBinary && isJson && (
        <ReactJson
          src={result.responseBody}
          collapsed={isCollapse ? 1 : false}
          collapseStringsAfterLength={100}
          enableClipboard={false}
          theme="tomorrow"
          name={null}
          displayDataTypes={false}
          displayObjectSize={false}
          style={{
            padding: '20px 10px',
            backgroundColor: 'transparent',
            color: colors.reactJson,
            fontSize: '12px',
            overflow: 'visible',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        />)
      }
      {!result.isBinary && !isJson && (
        <pre className="tomorrow-night" style={notJsonStyle}>
          <div className="cm-s-tomorrow-night codemirror-highlight">
            {syntaxHighlighter(`${result.responseBody}`, result.type)}
          </div>
        </pre>
      )}
    </div>
  );
}

Result.propTypes = {
  // eslint-disable-next-line react/require-default-props
  isCollapse: PropTypes.bool,
  result: PropTypes.shape({
    isBinary: PropTypes.bool,
    type: PropTypes.string,
    responseBody: PropTypes.any,
  }).isRequired,
};
Result.defaultProps = {
  isCollapse: false
}
