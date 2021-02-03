const React = require('react');
const Component = React.Component;

const BaseMultiSchemaField = require('@readme/oas-form/src/components/fields/MultiSchemaField').default;
const fieldProps = require('@readme/oas-form/src/types').fieldProps;
const {
  getDefaultFormState,
  getMatchingOption,
  // deepEquals,
} = require('@readme/oas-form/src/utils');

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
  if (schema.discriminator) {
      return schema.discriminator;
  }

  // Sometimes discriminators are within each of the oneOf schemas, and not top level.
  if (schema.properties?.oneOf?.[0]?.discriminator) {
      return schema.properties?.oneOf?.[0]?.discriminator;
  }

  // Sometimes discriminators are within each of the anyOf schemas, and not top level.
  if (schema.properties?.anyOf?.[0]?.discriminator) {
      return schema.properties?.anyOf?.[0]?.discriminator;
  }

  return false;
}

class MultiSchemaField extends Component {
  constructor(props) {
    super(props);
    const { formData, options, schema } = this.props;
    let discriminatorSchema = findDiscriminatorSchema(schema);

    this.state = {
      selectedOption: this.getMatchingOption(formData, options),
      discriminatorSchema,
      discriminatorFieldSchema: discriminatorSchema ? extractDiscriminatorField(schema, discriminatorSchema.propertyName) : null
    };
  }

  getOptionIndex(value, options) {
    return options.findIndex((item) => item.title === value);
  }

  onOptionChange = (option) => {
    const { formData, onChange, options, registry } = this.props;
    const { discriminatorSchema } = this.state;
    const selectedOption = this.getOptionIndex(option, options);
    const { rootSchema } = registry;

    if (discriminatorSchema) {
      formData[discriminatorSchema.propertyName] = option;
    }

    // Call getDefaultFormState to make sure defaults are populated on change.
    onChange(getDefaultFormState(options[selectedOption], formData, rootSchema));

    this.setState({
      selectedOption,
      selectedValue: option
    });
  };

  getMatchingOption(formData, options) {
    const option = getMatchingOption(formData, options);
    if (option !== 0) {
      return option;
    }

    // If the form data matches none of the options, use the currently selected
    // option, assuming it's available; otherwise use the first option
    return this && this.state ? this.state.selectedOption : 0;
  }

  render () {
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

    } = this.props;

    const _SchemaField = registry.fields.SchemaField;
    const { selectedOption, selectedValue, discriminatorSchema, discriminatorFieldSchema } = this.state;

    if (discriminatorSchema) {
      const option = options[selectedOption] || null;
      let optionSchema;

      // This is from the original multiSchema, not completely sure what edge case it is addressing.
      if (option) {
        // If the subschema doesn't declare a type, infer the type from the
        // parent schema
        optionSchema = option.type ? option : { ...option, type: baseType };
      }

      const enumOptions = (schema.oneOf || schema.anyOf).map((opt, index) => {
        const option = opt.title;

        return {
          label: option,
          value: option,
        };
      });

      if (discriminatorSchema.mapping) {
        // merge options with discriminatorSchema.mapping;
        enumOptions.push({label:'TODO: mapping', value: 'TODO: mapping'});
      }

      // Define the values, force a selecte element and forward the remaining uiSchema object.
      let selectUiSchema = {'ui:options': {'enumOptions': enumOptions, 'hideEmpty': true}, 'ui:widget': 'select', ...uiSchema};
      return (
        <div className="panel panel-default panel-body">
          <div className="form-group">
            <_SchemaField
              disabled={disabled}
              errorSchema={errorSchema}
              formData={selectedValue}
              idPrefix={idPrefix}
              idSchema={idSchema}
              label={discriminatorSchema.propertyName}
              name={discriminatorSchema.propertyName}
              onBlur={onBlur}
              onChange={this.onOptionChange}
              onFocus={onFocus}
              registry={registry}
              schema={discriminatorFieldSchema}
              uiSchema={selectUiSchema}
            />
          </div>

          {option !== null && (
            <_SchemaField
              disabled={disabled}
              errorSchema={errorSchema}
              formData={formData}
              idPrefix={idPrefix}
              idSchema={idSchema}
              onBlur={onBlur}
              onChange={onChange}
              onFocus={onFocus}
              registry={registry}
              schema={optionSchema}
              uiSchema={uiSchema}
            />
          )}
        </div>
      );
    }

    return <BaseMultiSchemaField {...this.props} />;
  }
}

MultiSchemaField.propTypes = fieldProps;

module.exports = function createMultiSchemaField () {
  return MultiSchemaField;
}