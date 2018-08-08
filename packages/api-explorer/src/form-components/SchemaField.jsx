const React = require('react');
const PropTypes = require('prop-types');

const BaseSchemaField = require('react-jsonschema-form/lib/components/fields/SchemaField').default;

function createSchemaField() {
  function SchemaField(props) {
    if (props.schema.type === 'boolean') {
      props.schema.enumNames = ['true', 'false'];
      return <BaseSchemaField {...props} uiSchema={{ 'ui:widget': 'select' }} />;
    }
    return <BaseSchemaField {...props} />;
  }

  SchemaField.propTypes = {
    schema: PropTypes.shape({
      type: PropTypes.string,
      enumNames: PropTypes.array,
    }).isRequired,
  };

  return SchemaField;
}

module.exports = createSchemaField;
