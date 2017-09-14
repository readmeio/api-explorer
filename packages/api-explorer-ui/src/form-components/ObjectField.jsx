// https://github.com/mozilla-services/react-jsonschema-form/blob/03b54d086036167d5e1aa970c9d4d103dd766617/src/components/fields/ObjectField.js
const React = require('react');
const ObjectField = require('react-jsonschema-form/lib/components/fields/ObjectField').default;

const {
  orderProperties,
  retrieveSchema,
  getDefaultRegistry,
} = require('react-jsonschema-form/lib/utils');

class CustomObjectField extends ObjectField {
  render() {
    const {
      uiSchema,
      formData,
      errorSchema,
      idSchema,
      name,
      required,
      disabled,
      readonly,
      onBlur,
      onFocus,
      registry = getDefaultRegistry(),
    } = this.props;
    const { definitions, fields, formContext } = registry;
    const { SchemaField, TitleField, DescriptionField } = fields;
    const schema = retrieveSchema(this.props.schema, definitions);
    const title = schema.title === undefined ? name : schema.title;
    let orderedProperties;
    try {
      const properties = Object.keys(schema.properties);
      orderedProperties = orderProperties(properties, uiSchema['ui:order']);
    } catch (err) {
      return (
        <div>
          <p className="config-error" style={{ color: 'red' }}>
            Invalid {name || 'root'} object field configuration:
            <em>{err.message}</em>.
          </p>
          <pre>{JSON.stringify(schema)}</pre>
        </div>
      );
    }
    return (
      <div className="param-item">
        {(uiSchema['ui:title'] || title) && (
          <TitleField
            id={`${idSchema.$id}__title`}
            title={uiSchema['ui:title'] || title}
            required={required}
            formContext={formContext}
          />
        )}
        {(uiSchema['ui:description'] || schema.description) && (
          <DescriptionField
            id={`${idSchema.$id}__description`}
            description={uiSchema['ui:description'] || schema.description}
            formContext={formContext}
          />
        )}
        {orderedProperties.map((name, index) => {
          return (
            <SchemaField
              key={index}
              name={name}
              required={this.isRequired(name)}
              schema={schema.properties[name]}
              uiSchema={uiSchema[name]}
              errorSchema={errorSchema[name]}
              idSchema={idSchema[name]}
              formData={formData[name]}
              onChange={this.onPropertyChange(name)}
              onBlur={onBlur}
              onFocus={onFocus}
              registry={registry}
              disabled={disabled}
              readonly={readonly}
            />
          );
        })}
      </div>
    );
  }
}

module.exports = CustomObjectField;
