const React = require('react');
const PropTypes = require('prop-types');

const BaseSchemaField = require('react-jsonschema-form/lib/components/fields/SchemaField').default;

function getDefaultNumFormat(type) {
  if (type === 'integer') return 'int32';
  if (type === 'number') return 'float';
  return '';
}

function doesFormatExist(widgets, type, format) {
  const availableFormats = Object.keys(widgets);

  return type === 'string' && availableFormats.includes(format);
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
  if (!doesFormatExist(props.registry.widgets, props.schema.type, props.schema.format))
    props.schema.format = undefined;

  if (props.schema.readOnly) {
    // Maybe use this when it's been merged?
    // Though that just sets `input[readonly]` which still shows
    // the input, which isnt exactly what we want
    //
    // We have to perform this at the view layer and not in
    // parameters-to-json-schema because we may only have
    // a $ref at that point
    // https://github.com/mozilla-services/react-jsonschema-form/pull/888
    return <BaseSchemaField {...props} uiSchema={{ 'ui:widget': 'hidden' }} />;
  }

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
    readOnly: PropTypes.bool,
  }).isRequired,
  registry: PropTypes.shape({
    widgets: PropTypes.object,
  }).isRequired,
  uiSchema: PropTypes.shape({}),
};

SchemaField.defaultProps = { uiSchema: {} };

function createSchemaField() {
  return SchemaField;
}

module.exports = createSchemaField;
