import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'

import './params.css'
import ContentWithTitle from './components/ContentWithTitle'
import JsonForm from './JsonForm'

const Oas = require('./lib/Oas');

const { Operation } = Oas;
const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

class Params extends Component{
  renderParam(schema) {
    const {
      onChange,
      onSubmit,
      setFormSubmissionListener,
      intl
    } = this.props
    return(
      <JsonForm
        title={intl.formatMessage({id: `doc.params.${schema.label.toLowerCase().replace(/\s/g,'')}`, defaultMessage: schema.label})}
        schema={schema.schema}
        onChange={values => onChange({ schema, formData: { [schema.type]: values } })}
        onSubmit={() => onSubmit()}
        setFormSubmissionListener={setFormSubmissionListener}
      />
    )
  }

  render() {
    const {oas, operation} = this.props
    const jsonSchema = parametersToJsonSchema(operation, oas);
    if (!jsonSchema) {
      return null
    }
    return jsonSchema.map((schema) => {
        return (
          <ContentWithTitle
            key={schema.label+schema.schema.ref}
            content={this.renderParam(schema)}
            showDivider={false}
            theme={'dark'}
            showBorder={false}
            titleUpperCase
          />
        )
      })
  }
}

export default injectIntl(Params)

Params.propTypes = {
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  formData: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  setFormSubmissionListener: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};
