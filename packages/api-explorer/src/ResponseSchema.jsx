import React, { Fragment } from 'react';

import ContentWithTitle from './components/ContentWithTitle'
import Select from './components/Select'

const PropTypes = require('prop-types');

const Oas = require('./lib/Oas');
const findSchemaDefinition = require('./lib/find-schema-definition');
const ResponseSchemaBody = require('./ResponseSchemaBody');

const { Operation } = Oas;

class ResponseSchema extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStatus: Object.keys(props.operation.responses || {})[0],
    };
    this.selectedStatus = this.selectedStatus.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  getSchema(operation) {
    const oas = this.props.oas;
    const content = this.getContent(operation, oas);

    if (!content) return null;

    const firstContentType = Object.keys(content)[0];

    if (
      content[firstContentType] &&
      content[firstContentType].schema &&
      content[firstContentType].schema.$ref
    ) {
      return findSchemaDefinition(content[firstContentType].schema.$ref, oas);
    }

    if (content[firstContentType] && content[firstContentType].schema) {
      return content[firstContentType].schema;
    }

    return null;
  }

  getContent(operation, oas) {
    const status = this.state.selectedStatus;
    const response = operation && operation.responses && operation.responses[status];

    if (!response) return false;

    if (response.$ref) return findSchemaDefinition(response.$ref, oas).content;
    return response.content;
  }

  changeHandler(status) {
    this.selectedStatus(status);
  }

  selectedStatus(selected) {
    this.setState({ selectedStatus: selected });
  }

  renderHeader(){
    const keys = Object.keys(this.props.operation.responses);
    
    return(
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <span>Response</span>
        <Select options={keys} onChange={this.changeHandler} value={this.state.selectedStatus} />
      </div>
    )
  }
  renderContent(){
    const { operation, oas } = this.props;
    const schema = this.getSchema(operation);
    return(
      <Fragment>
        {operation.responses[this.state.selectedStatus].description && (
        <p>{operation.responses[this.state.selectedStatus].description}</p>
      )}
        { schema && <ResponseSchemaBody schema={schema} oas={oas} />}
      </Fragment>
    )
  }

  render() {
    const { operation } = this.props;
    if (!operation.responses || Object.keys(operation.responses).length === 0) return null;
    return (
      <ContentWithTitle
        title={this.renderHeader()}
        content={this.renderContent()}
        showDivider={false}
        theme={'dark'}
        showBorder={false}
        titleUpperCase
      />
    );
  }
}

ResponseSchema.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
  oas: PropTypes.instanceOf(Oas).isRequired
};

module.exports = ResponseSchema;
