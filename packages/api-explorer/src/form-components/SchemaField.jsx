const React = require('react');
const PropTypes = require('prop-types');

const BaseSchemaField = require('react-jsonschema-form/lib/components/fields/SchemaField').default;

function createSchemaField() {
  function SchemaField(props) {
    if (props.schema.type === 'string' && props.schema.format === 'json') {
      return <BaseSchemaField {...props} uiSchema={Object.assign({}, props.uiSchema, { classNames: 'field-json' })} />;
    }
    if (props.schema.type === 'boolean') {
      props.schema.enumNames = ['true', 'false'];
      return <BaseSchemaField {...props} uiSchema={{ 'ui:widget': 'select' }} />;
    }
    return <BaseSchemaField {...props} />;
  }

  SchemaField.propTypes = {
    schema: PropTypes.shape({
      type: PropTypes.string,
      format: PropTypes.string,
      enumNames: PropTypes.array,
    }).isRequired,
    uiSchema: PropTypes.shape({}),
  };

  SchemaField.defaultProps = { uiSchema: {} };

  return SchemaField;
}

module.exports = createSchemaField;
