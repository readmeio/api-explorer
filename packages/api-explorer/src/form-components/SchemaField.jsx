require('../../style/main.scss');

const React = require('react');
const PropTypes = require('prop-types');

const BaseSchemaField = require('@readme/react-jsonschema-form/lib/components/fields/SchemaField').default;
const { ADDITIONAL_PROPERTY_FLAG, findSchemaDefinition } = require('@readme/react-jsonschema-form/lib/utils');

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
        'blob',
        'date',
        'date-time',
        'html',
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

  if (isNumType(schema, 'integer', /int8|int16|int32|int64/) || isNumType(schema, 'number', /float|double/)) {
    return schema.format;
  }

  return false;
}

function getTypeLabel(schema) {
  let type = getCustomType(schema) || schema.type;

  if ('items' in schema && 'type' in schema.items) type += ` of ${schema.items.type}s`;

  return type;
}

function CustomTemplateShell(props) {
  const { classNames, help, errors, children } = props;

  return (
    <div className={`${classNames} param`}>
      {children}
      {errors && <div className="errors">{errors}</div>}
      {help && <div className="help">{help}</div>}
    </div>
  );
}

function CustomTemplate(props) {
  const { id, classNames, label, help, required, description, errors, children, schema, onKeyChange } = props;

  const EditLabel = (
    <input defaultValue={label} id={`${id}-key`} onBlur={event => onKeyChange(event.target.value)} type="text" />
  );

  return (
    <div className={`${classNames} param`}>
      <span className="label">
        <label className="label-name" htmlFor={id}>
          {ADDITIONAL_PROPERTY_FLAG in schema ? EditLabel : label}
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
  let { schema } = props;

  // If this schema is going to be loaded with a $ref, prefetch it so we'll have a schema type to work with.
  if ('$ref' in schema) {
    schema = Object.assign(props.schema, findSchemaDefinition(schema.$ref, props.registry.rootSchema));
    delete schema.$ref;
  }

  if (!doesFormatExist(props.registry.widgets, schema.type, schema.format)) {
    schema.format = undefined;
  }

  if ('name' in props) {
    // If there's no name on this field, then it's a lone schema with no label or children and as such we shouldn't try
    // to render it with the custom template.
    props.registry.FieldTemplate = CustomTemplate;
  } else if ('oneOf' in schema || 'anyOf' in schema) {
    // If this is a oneOf or anyOf schema, render it using a shell of a CustomTemplate that will render it within our
    // `div.param` work so it doesn't look like hot garbage.
    //
    // See https://github.com/readmeio/api-explorer/pull/436#issuecomment-597428988 for more info.
    props.registry.FieldTemplate = CustomTemplateShell;
  }

  if ('readOnly' in schema && schema.readOnly) {
    // Maybe use this when it's been merged?
    // Though that just sets `input[readonly]` which still shows
    // the input, which isnt exactly what we want
    //
    // We have to perform this at the view layer and not in
    // parameters-to-json-schema because we may only have
    // a $ref at that point
    // https://github.com/mozilla-services/react-jsonschema-form/pull/888
    return <BaseSchemaField {...props} schema={schema} uiSchema={{ 'ui:widget': 'hidden' }} />;
  }

  const customType = getCustomType(schema);
  if (customType) {
    return (
      <BaseSchemaField {...props} schema={schema} uiSchema={{ ...props.uiSchema, classNames: `field-${customType}` }} />
    );
  }

  // Transform booleans from a checkbox into a dropdown.
  if (schema.type === 'boolean') {
    schema.enumNames = ['true', 'false'];
    return <BaseSchemaField {...props} schema={schema} uiSchema={{ 'ui:widget': 'select' }} />;
  }

  // The current ReadMe manual API editor saves mixed types as "mixed type", which isn't a real type
  // that's supported by the OAS. Since we don't have knowledge as to what those types are, let's
  // just convert it to a string so the parameter will at least render out.
  if (schema.type === 'mixed type') {
    schema.type = 'string';
  }

  return <BaseSchemaField {...props} schema={schema} />;
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

CustomTemplateShell.propTypes = {
  children: PropTypes.node.isRequired,
  classNames: PropTypes.string.isRequired,
  errors: PropTypes.node.isRequired,
  help: PropTypes.node.isRequired,
};

SchemaField.propTypes = {
  explorerEnabled: PropTypes.bool,
  registry: PropTypes.shape({
    FieldTemplate: PropTypes.func,
    rootSchema: PropTypes.object,
    widgets: PropTypes.object,
  }).isRequired,
  schema: PropTypes.shape({
    $ref: PropTypes.string,
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
