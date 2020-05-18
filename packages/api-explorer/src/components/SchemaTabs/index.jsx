import React, { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash.get'
import { FormattedMessage } from 'react-intl';

import parametersToJsonSchema from '../../lib/parameters-to-json-schema'
import BlockWithTab from '../BlockWithTab'
import ResponseSchema from '../../ResponseSchema';
import RequestSchema from '../../RequestSchema';
import SchemaExample from '../../components/SchemaExample'
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
    <div style={{padding: 10, background: colors.schemaTabMissingSchemaBackground}}>
      <FormattedMessage id={`schemaTabs.missing.${nameSchema.toLowerCase()}`} defaultMessage={`${nameSchema} schema not set`} />
    </div>
  )
}

export default class SchemaTabs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: 'example'
    }
  }

  renderSchemaExample() {
    const { operation, oas } = this.props
    const schema = get(parametersToJsonSchema(operation, oas), '[0].schema', false)
    // console.log('lodash schema example', schema)
    return schema ? (
      <SchemaExample schema={schema} />
    ) : renderMissingSchema('Example')
  }

  renderResponseSchema() {
    const { operation, oas } = this.props
    return (
      operation &&
        operation.responses ? (
          <ResponseSchema operation={operation} oas={oas} />
        )
        : renderMissingSchema('Response')
    )
  }

  renderRequestSchema() {
    const { operation, oas } = this.props
    return operation && operation.requestBody ? (
      <RequestSchema operation={operation} oas={oas} />
    ) : renderMissingSchema('Request')
  }

  renderSchema () {
    const {selected} = this.state
    const selectedType = () => {
      switch (selected) {
        case 'request': {
          return this.renderRequestSchema()
        }
        case 'response': {
          return this.renderResponseSchema()
        }
        default: {
          return this.renderSchemaExample()
        }
      }
    }

    return (
      <div style={{paddingTop: 10}}>
        {selectedType()}
      </div>
    )
  }

  render() {
    const {selected} = this.state
    return (
      <BlockWithTab
        items={[
          { value: 'example', label: <FormattedMessage id='schemaTabs.label.example' defaultMessage='Example' /> },
          { value: 'request', label: <FormattedMessage id='schemaTabs.label.request' defaultMessage='Request' /> },
          { value: 'response', label: <FormattedMessage id='schemaTabs.label.response' defaultMessage='Response' />}
        ]}
        selected={selected}
        styleList={styleList}
        styleSelectedItem={styleSelectedItem}
        styleLink={styleLink}
        styleItem={styleItem}
        onClick={(item) => this.setState({selected: item})}
      >
        {this.renderSchema()}
      </BlockWithTab>
    )
  }
}

SchemaTabs.propTypes = {
  operation: PropTypes.object, // eslint-disable-line react/require-default-props
  oas: PropTypes.object // eslint-disable-line react/require-default-props
}
