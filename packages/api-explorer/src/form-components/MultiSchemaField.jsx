require('../../style/main.scss');

const React = require('react');
const PropTypes = require('prop-types');

const BaseMultiSchemaField = require('@readme/oas-form/src/components/fields/MultiSchemaField').default;
const fieldProps = require('@readme/oas-form/src/types').fieldProps;

function extractDiscriminatorField(schema, property) {
  if (schema.properties?.[property]) {
    const discSchema = schema.properties[property];
    delete schema.properties[property];
    return discSchema;
  }

  // Sometimes discriminators are within each of the oneOf schemas, and not top level.
  if (schema.oneOf) {
    return extractDiscriminatorField(schema.oneOf[0], property);
  }

  // Sometimes discriminators are within each of the anyOf schemas, and not top level.
  if (schema.anyOf) {
    return extractDiscriminatorField(schema.anyOf[0], property);
  }

  // Sometimes discriminators are within each of the anyOf schemas, and not top level.
  if (schema.allOf) {
    return extractDiscriminatorField(schema.allOf[0], property);
  }

  return null;
}

/**
 * Navigates a schema, trying to find the discriminator that describes this schema.
 */
function findDiscriminatorSchema(schema) {
  console.log('finding discrim', schema);
  if (schema.discriminator) {
      console.log('discr 1', schema.discriminator);
      return schema.discriminator;
  }

  // Sometimes discriminators are within each of the oneOf schemas, and not top level.
  if (schema.properties?.oneOf?.[0]?.discriminator) {
      console.log('discr 2', schema.properties?.oneOf?.[0]?.discriminator);
      return schema.properties?.oneOf?.[0]?.discriminator;
  }

  // Sometimes discriminators are within each of the anyOf schemas, and not top level.
  if (schema.properties?.anyOf?.[0]?.discriminator) {
      console.log('discr 3', schema.properties?.anyOf?.[0]?.discriminator);
      return schema.properties?.anyOf?.[0]?.discriminator;
  }

  return false;
}

function createMultiSchemaField() {
  function MultiSchemaField(props) {
    const {
      baseType,
      disabled,
      errorSchema,
      formData,
      idPrefix,
      idSchema,
      onBlur,
      onChange,
      onFocus,
      options,
      registry,
      uiSchema,
      schema,
    } = props;

    const _SchemaField = registry.fields.SchemaField;
    console.log('multi schema', schema);
    const discriminatorSchema = findDiscriminatorSchema(schema);
    console.log('disc schema', discriminatorSchema);

    // TODO:
    // 1. Get the discriminator field looking good
    // 2. Get the mapping working
    // 3. Tests
    if (discriminatorSchema) {
      const discriminatorFieldSchema = extractDiscriminatorField(schema, discriminatorSchema.propertyName);

      const discriminatorField = <_SchemaField
        disabled={disabled}
        errorSchema={errorSchema}
        formData={formData}
        idPrefix={idPrefix}
        idSchema={idSchema}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        registry={registry}
        schema={discriminatorFieldSchema}
        uiSchema={uiSchema}
      />;

      return <BaseMultiSchemaField
        discriminatorField={discriminatorField}
        discriminatorMapping={discriminatorSchema.mapping}
        {...props} />;
    }

    console.log('multi schema props', props);
    return <BaseMultiSchemaField {...props} />;
  }

  MultiSchemaField.propTypes = fieldProps;

  return MultiSchemaField;
}

module.exports = createMultiSchemaField;
