import React from 'react';

import ContentWithTitle from './components/ContentWithTitle'
import JsonViewer from './components/JsonViewer'

const PropTypes = require('prop-types');

const Oas = require('./lib/Oas');
const parametersToJsonSchema = require('./lib/parameters-to-json-schema')

const { Operation } = Oas;

class RequestSchema extends React.Component {
  
  renderContent(){
    const { operation, oas } = this.props;
    let schema = parametersToJsonSchema(operation, oas)
    if(schema){
        schema = schema[0].schema
    }
    return(
      <JsonViewer schema={schema} missingMessage={'request.missingSchema'} />
    )
  }

  render() {
    return (
      <ContentWithTitle
        content={this.renderContent()}
        showDivider={false}
        theme={'dark'}
        showBorder={false}
        titleUpperCase
      />
    );
  }
}

RequestSchema.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
  oas: PropTypes.instanceOf(Oas).isRequired
};

module.exports = RequestSchema;
