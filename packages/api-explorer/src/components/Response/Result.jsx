import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'

import colors from '../../colors'
import {notJsonStyle} from './style'

const syntaxHighlighter = require('@mia-platform/syntax-highlighter');
const ReactJson = require('react-json-view').default;
const contentTypeIsJson = require('../../lib/content-type-is-json');

export default function Result({ result }) {
    const isJson =
      result.type && contentTypeIsJson(result.type) && typeof result.responseBody === 'object';
  
    return (
      <div>
        {result.isBinary && <div><FormattedMessage id="api.response.binary" defaultMessage="A binary file was returned" /></div>}
        {!result.isBinary &&
        isJson && (
          <ReactJson
            src={result.responseBody}
            collapsed={1}
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
          />
        )}
        {!result.isBinary &&
        !isJson && (
          <pre className="tomorrow-night" style={notJsonStyle}>
            <div className="cm-s-tomorrow-night codemirror-highlight">
              {syntaxHighlighter(result.responseBody, result.type)}
            </div>
          </pre>
        )}
      </div>
    );
  }
  
  Result.propTypes = {
    result: PropTypes.shape({}).isRequired,
  };
