import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl';

import BlockWithTab from '../BlockWithTab'
import ResponseSchema from '../../ResponseSchema';
import RequestSchema from '../../RequestSchema';
import colors from '../../colors'

const styleList = {
  fontSize: '18px',
  color: colors.schemaTabSelectedItem,
  textTransform: 'uppercase',
  borderBottom: `1px solid ${colors.schemaTabListBorder}`,
  fontWeight: 'bold',
  background: 'none',
  padding: 0
}
const styleSelectedItem = {
  color: colors.schemaTabSelectedItem,
  background: 'none',
  borderBottom: `3px solid ${colors.schemaTabSelectedItem}`
}
const styleLink = {
  color: 'inherit'
}
const styleItem = {
  borderBottom: `3px solid ${colors.schemaTabItemBorder}`,
  color: colors.schemaTabItemColor
}

function renderMissingSchema(nameSchema) {
  return (
    <div style={{
      padding: 10,
      background: colors.schemaTabMissingSchemaBackground
    }}
    >
      <FormattedMessage id={`schemaTabs.missing.${nameSchema}`} />
    </div>
  )
}
export default class SchemaTabs extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selected: 'request'
    }
  }

  renderResponseSchema() {
    const { operation, oas } = this.props
    return (
      operation &&
        operation.responses ? (
          <ResponseSchema operation={operation} oas={oas} />
        )
        : renderMissingSchema('response')
    )
  }

  renderRequestSchema() {
    const { operation, oas } = this.props
    return (
      operation &&
        operation.requestBody ? (
          <RequestSchema operation={operation} oas={oas} />
        )
        : renderMissingSchema('request')
    )
  }

  render() {
    const { selected } = this.state
    return (
      <BlockWithTab
        items={[{ value: 'request', label: 'request' }, { value: 'response', label: 'response' }]}
        selected={selected}
        styleList={styleList}
        styleSelectedItem={styleSelectedItem}
        styleLink={styleLink}
        styleItem={styleItem}
        onClick={(item) => {
          this.setState({
            selected: item
          })
        }}
      >
        {
          selected === 'request' ?
            this.renderRequestSchema() :
            this.renderResponseSchema()
        }
      </BlockWithTab>
    )
  }
}

SchemaTabs.propTypes = {
  operation: PropTypes.object, // eslint-disable-line react/require-default-props
  oas: PropTypes.object // eslint-disable-line react/require-default-props
}
