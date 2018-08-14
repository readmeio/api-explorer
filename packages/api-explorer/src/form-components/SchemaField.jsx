const React = require('react');
const PropTypes = require('prop-types');

const BaseSchemaField = require('react-jsonschema-form/lib/components/fields/SchemaField').default;

function isNumType(schema, type, format) {
  return schema.type === type && schema.format.match(format);
}

function SchemaFieldWithClassName(props) {
  return (
    <BaseSchemaField
      {...props}
      uiSchema={Object.assign({}, props.uiSchema, { classNames: props.classNames })}
    />
  );
}

SchemaFieldWithClassName.propTypes = {
  uiSchema: PropTypes.shape({}),
  classNames: PropTypes.string.isRequired,
};

SchemaFieldWithClassName.defaultProps = { uiSchema: {} };

function createSchemaField() {
  function SchemaField(props) {
    if (props.schema.type === 'string' && props.schema.format === 'json') {
      return <SchemaFieldWithClassName {...props} classNames={'field-json'} />;
    }
    if (props.schema.type === 'string' && props.schema.format === 'binary') {
      return <SchemaFieldWithClassName {...props} classNames={'field-file'} />;
    }
    if (isNumType(props.schema, 'integer', /int32|int64/) || isNumType(props.schema, 'number', /float|double/)) {
      return <SchemaFieldWithClassName {...props} classNames={`field-${props.schema.format}`} />;
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
  };

  return SchemaField;
}

module.exports = createSchemaField;
