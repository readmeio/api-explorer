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
    const { formData, options, schema, registry } = this.props;
    const { rootSchema } = registry;

    let discriminatorSchema = findDiscriminatorSchema(schema);
    let enumOptions = null;

    if (discriminatorSchema.mapping) {
      enumOptions = this.getMappingOptions(discriminatorSchema.mapping, options, rootSchema.components?.schemas);
    } else {
      let componentSchemas = rootSchema.components?.schemas;

      if (componentSchemas) {
        enumOptions = this.getSchemaOptions(options, componentSchemas);
      }
    }

    this.state = {
      selectedOption: this.getMatchingOption(formData, options),
      discriminatorSchema,
      discriminatorFieldSchema: discriminatorSchema ? extractDiscriminatorField(schema, discriminatorSchema.propertyName) : null,
      enumOptions
    };
  }

  /**
   * See getSchemaOptions for more thorough details. This basicaly does that, but uses the aliases in the mapping as values instead of the
   * schema keys
   */
  getMappingOptions(mapping, discriminatorSchemas, componentSchemas) {
    const validSchemas = {};

    // Get a list of valid schemas listed in the mapping and format it to look like its own component schema object, but with the mapping keys instead of real keys
    //   so we can reuse getSchemaOptions.
    for(const key in mapping) {
      const match = mapping[key].match(/#\/components\/schemas\/([^/]+)/);
      if (match && componentSchemas[match[1]]) {
        validSchemas[key] = componentSchemas[match[1]];
      }
    }

    return this.getSchemaOptions(discriminatorSchemas, validSchemas);
  }

  /**
   * rjsf/oas-form adds an empty format field to the schema if there isn't one. We don't want that, to ensure we can identify equality with the schema component
   */
  cleanDiscriminatorSchema(schema) {
    let copy = {...schema};
    if (copy.format === '') {
      delete copy.format;
    }
    return copy;
  }

  /**
   * This is a fun one. So here we go.
   *
   * If we want to generate a list of options for the discriminator drop down, we look at the schemas in the oneOf/anyOf. Unfortunately the "value" of the discriminator
   * is the name of that schema as referenced in the components/schemas list. This is unfortunate because by the time we recieve the schema in this code it has already been
   * dereferenced and we've lost the json pointer.
   *
   * The solution is to compare the schema objects in the oneOf/anyOf to everything in the components/schemas list and use that to identify the names we should use.
   *
   * The final order of this is SUPER IMPORTANT, because the existing multischema component renders the options in the numeric order of the schemas in the oneOf/anyOf.
   * So we need the values to appear in that same order, otherwise you might have a name render the wrong schema.
   *
   * If we wanted to drop the order requirement, we would need to investigate further the mix between the incoming options, and the list of schemas we generate. Maybe
   * we could store a key value pair of name=>schema, of valid options, and rely exclusively on that for this entire file. It would probably clean this code up a little bit.
   */
  getSchemaOptions(discriminatorSchemas, componentSchemas) {
    let options = [];


    for (const discSchema of discriminatorSchemas) {
      for (const componentKey in componentSchemas) {
        if (JSON.stringify(this.cleanDiscriminatorSchema(discSchema)) === JSON.stringify(componentSchemas[componentKey])) {
          options.push({
            label: componentKey,
            value: componentKey
          });
        }
      }
    }

    return options;
  }

  /**
   * Handles the dropdown selection of your schema.
   *
   * The incoming option is the selection value
   *
   */
  onOptionChange = (option) => {
    const { formData, onChange, options, registry } = this.props;
    const { discriminatorSchema, enumOptions } = this.state;
    const selectedOption = enumOptions.findIndex((item) => item.value === option);
    const { rootSchema } = registry;

    if (discriminatorSchema) {
      formData[discriminatorSchema.propertyName] = option;
    }

    // Update the formData so the example code is properly rendered and ensure defaults are applied if applicable
    // Note: defaults might not be applicable, this line largely from the original multischema code!
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
    } = this.props;

    const _SchemaField = registry.fields.SchemaField;
    const { selectedOption, selectedValue, discriminatorSchema, discriminatorFieldSchema, enumOptions } = this.state;
    const { rootSchema } = registry;

    // We've got a custom path if there's a discriminator, otherwise we fall back ot the old multischema field
    if (discriminatorSchema) {
      // Find which schema we wnat to render by looking at the options prop. The index of the schema we want to render there matches
      // the schema we want in
      const option = options[selectedOption] || null;
      let optionSchema;

      // This is from the original multiSchema, not completely sure what edge case it is addressing.
      if (option) {
        // If the subschema doesn't declare a type, infer the type from the
        // parent schema
        optionSchema = option.type ? option : { ...option, type: baseType };
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