const React = require('react');
const Component = React.Component;

const BaseMultiSchemaField = require('@readme/oas-form/src/components/fields/MultiSchemaField').default;
const fieldProps = require('@readme/oas-form/src/types').fieldProps;
const {
  guessType,
  retrieveSchema,
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
    const { formData, options } = this.props;

    this.state = {
      selectedOption: this.getMatchingOption(formData, options),
    };
  }

  onOptionChange = (option) => {
    const selectedOption = parseInt(option, 10);
    const { formData, onChange, options, registry } = this.props;
    const { rootSchema } = registry;
    const newOption = retrieveSchema(options[selectedOption], this.schema, formData);

    // If the new option is of type object and the current data is an object,
    // discard properties added using the old option.
    let newFormData;
    if (guessType(formData) === 'object' && (newOption.type === 'object' || newOption.properties)) {
      newFormData = { ...formData };

      const optionsToDiscard = options.slice();
      optionsToDiscard.splice(selectedOption, 1);

      // Discard any data added using other options
      for (const opt of optionsToDiscard) {
        if (opt.properties) {
          for (const key in opt.properties) {
            if (newFormData.hasOwnProperty(key)) {
              delete newFormData[key];
            }
          }
        }
      }
    }

    // Call getDefaultFormState to make sure defaults are populated on change.
    onChange(getDefaultFormState(options[selectedOption], newFormData, rootSchema));

    this.setState({
      selectedOption: parseInt(option, 10),
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
    const { selectedOption } = this.state;
    const discriminatorSchema = findDiscriminatorSchema(schema);

    if (discriminatorSchema) {
      const option = options[selectedOption] || null;
      let optionSchema;

      if (option) {
        // If the subschema doesn't declare a type, infer the type from the
        // parent schema
        optionSchema = option.type ? option : { ...option, type: baseType };
      }

      // Pull the field out of the schema and store it locally. We extract so it's not rendered twice, we
      // store locally so that when you change the select element we can still find it.
      if (!this.discriminatorFieldSchema) {
        this.discriminatorFieldSchema = extractDiscriminatorField(schema, discriminatorSchema.propertyName);
        this.discriminatorFieldSchema.default = Object.keys(options[0]);
      }

      const enumOptions = (schema.oneOf || schema.anyOf).map((opt, index) => ({
        label: opt.title || `Option ${index + 1}`,
        value: index,
      }));

      if (discriminatorSchema.mapping) {
        // merge options with discriminatorSchema.mapping;
        enumOptions.push({label:'TODO: mapping', value: 'TODO: mapping'});
      }

      let selectUiSchema = {'ui:widget': 'select', ...uiSchema}
      return (
        <div className="panel panel-default panel-body">
          <div className="form-group">
            <_SchemaField
              disabled={disabled}
              errorSchema={errorSchema}
              formData={selectedOption}
              idPrefix={idPrefix}
              idSchema={idSchema}
              label={discriminatorSchema.propertyName}
              name={discriminatorSchema.propertyName}
              onBlur={onBlur}
              onChange={this.onOptionChange}
              onFocus={onFocus}
              registry={registry}
              schema={this.discriminatorFieldSchema}
              uiSchema={{'ui:options': {'enumOptions': enumOptions}, ...selectUiSchema}}
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