import React, { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash.get'
import refParser from '@apidevtools/json-schema-ref-parser'
import {FormattedMessage} from 'react-intl';
import {omit} from 'ramda'
import {Alert} from 'antd'

import parametersToJsonSchema from '../../lib/parameters-to-json-schema'
import generateFakeSchema from '../../../lib/generateFakeSchema'

import BlockWithTab from '../BlockWithTab'
import colors from '../../colors'
import JsonViewer from "../JsonViewer";
import resolveRootRef from "../../JsonForm/resolveRootRef";
import Select from "../Select";

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

const EXAMPLE = 'example'
const REQUEST = 'request'
const RESPONSE = 'response'

function renderMissingSchema(nameSchema) {
  return (
    <div style={{padding: 10, background: colors.schemaTabMissingSchemaBackground}}>
      <FormattedMessage id={`schemaTabs.missing.${nameSchema.toLowerCase()}`} defaultMessage={`${nameSchema} schema not set`} />
    </div>
  )
}

const styles = {
  responseSchemaWrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  responseSchemaSelect: {
    margin: '0 0 8px auto',
  }
}

export default class SchemaTabs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: EXAMPLE,
      selectedStatus: undefined,
      schema: undefined
    }
  }

  static getDerivedStateFromProps(props, state) {
    const {operation} = props
    if (operation && operation.responses && !state.selectedStatus) {
      return {selectedStatus: Object.keys(operation.responses)[0]}
    }
    return null
  }

  componentDidMount() {
    const { operation, oas } = this.props
    const schema = get(parametersToJsonSchema(operation, oas), '[0].schema', {})
    refParser.dereference(resolveRootRef(schema), (err, schemaResolved) => {
      if (!err) {
        this.setState({schema: omit(['components'], schemaResolved)})
        return
      }
      this.setState({schema: omit(['components'], schema)})
    })
  }

  renderSchemaExample() {
    const {schema} = this.state
    let generatedSchema
    try {
      generatedSchema = generateFakeSchema(schema)
    } catch (error) {
      return <Alert type={'error'} message={error.message} />
    }
    return (
      <JsonViewer
        missingMessage={'schemaTabs.missing.example'}
        schema={generatedSchema}
        key={'json-viewer-example'}
      />
    )
  }

  renderResponseSchema() {
    const {operation} = this.props
    const {selectedStatus} = this.state
    return (
      <div style={styles.responseSchemaWrapper}>
        <Select
          firstActiveValue={selectedStatus}
          options={Object.keys(operation.responses)}
          onChange={value => this.setState({selectedStatus: value})}
          value={this.state.selectedStatus}
          style={styles.responseSchemaSelect}
        />
        <JsonViewer missingMessage={'schemaTabs.missing.response'} schema={operation.responses[selectedStatus]} />
      </div>
    )
  }

  renderRequestSchema() {
    const {schema} = this.state
    return (
      <JsonViewer
        key={'json-viewer-request'}
        missingMessage={'schemaTabs.missing.example'}
        schema={schema}
      />
    )
  }

  renderSchema () {
    const {operation} = this.props
    const {selected, schema} = this.state
    const hasSchema = schema && Object.keys(schema).length > 0
    const hasResponses = operation && operation.responses && Object.keys(operation.responses).length > 0

    const selectedType = () => {
      switch (selected) {
        case REQUEST: {
          return hasSchema ? this.renderRequestSchema() : renderMissingSchema(REQUEST)
        }
        case RESPONSE: {
          return hasResponses ? this.renderResponseSchema() : renderMissingSchema(RESPONSE)
        }
        case EXAMPLE: {
          return hasSchema ? this.renderSchemaExample() : renderMissingSchema(EXAMPLE)
        }
        default: {
          return null
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
          { value: EXAMPLE, label: <FormattedMessage id='schemaTabs.label.example' defaultMessage='Example' /> },
          { value: REQUEST, label: <FormattedMessage id='schemaTabs.label.request' defaultMessage='Request' /> },
          { value: RESPONSE, label: <FormattedMessage id='schemaTabs.label.response' defaultMessage='Response' />}
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
