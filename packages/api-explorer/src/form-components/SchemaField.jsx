const React = require('react');
const PropTypes = require('prop-types');

const BaseSchemaField = require('react-jsonschema-form/lib/components/fields/SchemaField').default;

function getDefaultNumFormat(type) {
  if (type === 'integer') return 'int32';
  if (type === 'number') return 'float';
  return '';
}

function isNumType(schema, type, format) {
  schema.format = schema.format || getDefaultNumFormat(schema.type);
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

function createSchemaField() {
  return SchemaField;
}

module.exports = createSchemaField;
