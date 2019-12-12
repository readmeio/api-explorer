// There's a bug in jsdom where Jest spits out heaps of errors from it not being able to interpret
// this file, so let's not include this when running tests since we aren't doing visual testing
// anyways.
// https://github.com/jsdom/jsdom/issues/217
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line global-require
  require('../../style/main.scss');
}

const React = require('react');
const PropTypes = require('prop-types');

const BaseSchemaField = require('react-jsonschema-form/lib/components/fields/SchemaField').default;
const { ADDITIONAL_PROPERTY_FLAG } = require('react-jsonschema-form/lib/utils');

function getDefaultNumFormat(type) {
  if (type === 'integer') return 'int32';
  if (type === 'number') return 'float';
  return '';
}

function doesFormatExist(widgets, type, format) {
  const availableFormats = Object.keys(widgets);

  return typeof type === 'string' && availableFormats.includes(format);
}

function isNumType(schema, type, format) {
  schema.format = schema.format || getDefaultNumFormat(schema.type);
  return schema.type === type && schema.format.match(format);
}

function getCustomType(schema) {
  if (schema.type === 'string') {
    if (schema.format) {
      if (schema.format === 'binary') return 'file';
      if (schema.format === 'dateTime') return 'date-time';

      const supportedStringFormats = [
        'date',
        'date-time',
        'json',
        'password',
        'timestamp',
        'uri',
        'url',
      ];

      if (supportedStringFormats.includes(schema.format)) {
        return schema.format;
      }
    }
  }

  if (
    isNumType(schema, 'integer', /int8|int16|int32|int64/) ||
    isNumType(schema, 'number', /float|double/)
  ) {
    return schema.format;
  }

  return false;
}

function getTypeLabel(schema) {
  let type = getCustomType(schema) || schema.type;

  if ('items' in schema && 'type' in schema.items) type += ` of ${schema.items.type}s`;

  return type;
}

function CustomTemplate(props) {
  const {
    id,
    classNames,
    label,
    help,
    required,
    description,
    errors,
    children,
    schema,
    onKeyChange,
  } = props;

  let editableLabel = label;
  if (ADDITIONAL_PROPERTY_FLAG in schema) {
    editableLabel = (
      <input
        defaultValue={label}
        id={`${id}-key`}
        onBlur={event => onKeyChange(event.target.value)}
        type="text"
      />
    );
  }

  return (
    <div className={`${classNames} param`}>
      <span className="label">
        <label className="label-name" htmlFor={id}>
          {editableLabel}
          {required && <span className="label-required">*</span>}
        </label>
        <span className="label-type">{getTypeLabel(schema)}</span>
        {description && <div className="description">{description}</div>}
      </span>
      {children && <div className="children">{children}</div>}
      {errors && <div className="errors">{errors}</div>}
      {help && <div className="help">{help}</div>}
    </div>
  );
}

function SchemaField(props) {
  if (!doesFormatExist(props.registry.widgets, props.schema.type, props.schema.format))
    props.schema.format = undefined;

  // If there's no name on this field, then it's a lone schema with no label or children and as such
  // we shouldn't try to render it with the custom template.
  if ('name' in props) props.registry.FieldTemplate = CustomTemplate;

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
        uiSchema={{ ...props.uiSchema, classNames: `field-${customType}` }}
      />
    );
  }

  if (props.schema.type === 'boolean') {
    props.schema.enumNames = ['true', 'false'];
    return <BaseSchemaField {...props} uiSchema={{ 'ui:widget': 'select' }} />;
  }

  // The current ReadMe manual API editor saves mixed types as "mixed type", which isn't a real type
  // that's supported by the OAS. Since we don't have knowledge as to what those types are, let's
  // just convert it to a string so the parameter will at least render out.
  if (props.schema.type === 'mixed type') {
    props.schema.type = 'string';
  }

  return <BaseSchemaField {...props} />;
}

CustomTemplate.propTypes = {
  children: PropTypes.node.isRequired,
  classNames: PropTypes.string.isRequired,
  description: PropTypes.node.isRequired,
  errors: PropTypes.node.isRequired,
  help: PropTypes.node.isRequired,
  id: PropTypes.node.isRequired,
  label: PropTypes.string,
  onKeyChange: PropTypes.func,
  required: PropTypes.bool,
  schema: PropTypes.shape({}).isRequired,
};

CustomTemplate.defaultProps = {
  onKeyChange: () => {},
};

SchemaField.propTypes = {
  registry: PropTypes.shape({
    FieldTemplate: PropTypes.func,
    widgets: PropTypes.object,
  }).isRequired,
  schema: PropTypes.shape({
    enumNames: PropTypes.array,
    format: PropTypes.string,
    readOnly: PropTypes.bool,
    type: PropTypes.string,
  }).isRequired,
  uiSchema: PropTypes.shape({}),
};

SchemaField.defaultProps = { uiSchema: {} };

function createSchemaField() {
  return SchemaField;
}

module.exports = createSchemaField;
