const React = require('react');
const PropTypes = require('prop-types');

const BaseSchemaField = require('react-jsonschema-form/lib/components/fields/SchemaField').default;

function isNumType(schema, type, format) {
  return schema.type === type && schema.format.match(format);
}

function getCustomType(schema) {
  if (schema.type === 'string') {
    if (schema.format === 'json') return 'json';
    if (schema.format === 'binary') return 'file';
  }

  if (isNumType(schema, 'integer', /int32|int64/) || isNumType(schema, 'number', /float|double/)) {
    return schema.format;
  }

  return false;
}

function createSchemaField() {
  function SchemaField(props) {
    const customType = getCustomType(props.schema);

    if (customType) {
      return (
        <BaseSchemaField
          {...props}
          uiSchema={Object.assign({}, props.uiSchema, { classNames: `field-${customType}` })}
        />
      );
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
