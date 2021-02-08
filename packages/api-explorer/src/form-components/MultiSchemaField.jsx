const React = require('react');
const Component = React.Component;

const BaseMultiSchemaField = require('@readme/oas-form/src/components/fields/MultiSchemaField').default;
const fieldProps = require('@readme/oas-form/src/types').fieldProps;
const {
  getDefaultFormState,
  deepEquals,
} = require('@readme/oas-form/src/utils');

/**
 * Find the property that the discriminator is referencing.
 */
function findDiscriminatorField(schema, options, property) {
  if (schema.properties?.[property]) {
    return schema.properties[property];
  }

  for (const option of options) {
    if (option.properties?.[property]) {
      return option.properties[property];
    }

    if (option.allOf?.[0]?.properties?.[property]) {
      return option.allOf[0].properties[property];
    }
  }

  return null;
}

/**
 * Navigates a schema, trying to find the discriminator details
 */
function findDiscriminatorDetails(schema) {
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

  // There is no allOf here becuase discriminators won't apply to allOfs. If an allOf contains a oneOf, you might see a discriminator there, and it will be caught by
  // the child multischemafield.

  return false;
}

class MultiSchemaField extends Component {
  constructor(props) {
    super(props);
    const { formData, options, schema, registry } = this.props;
    const { rootSchema } = registry;

    let discriminatorSchema = findDiscriminatorDetails(schema);
    let enumOptions = null;
    let initialSelectValue = null;
    let selectedOption = null;

    if (discriminatorSchema) {
      // If there's a mapping that mapping defines the dropdown list
      if (discriminatorSchema.mapping) {
        enumOptions = this.getMappingOptions(discriminatorSchema.mapping, options, rootSchema.components?.schemas);
      } else {
        // If there isn't a mapping, the provided options define the dropdown list.
        let componentSchemas = rootSchema.components?.schemas;

        if (componentSchemas) {
          enumOptions = this.getSchemaOptions(options, componentSchemas);
        }
      }

      initialSelectValue = formData[discriminatorSchema.propertyName] || enumOptions[0].value;
      selectedOption = this.findEnumOptionsIndex(enumOptions, initialSelectValue);
      this.notifyOptionSelection(selectedOption);
    }

    this.state = {
      selectedOption: selectedOption,
      selectedValue: initialSelectValue,
      discriminatorSchema,
      discriminatorFieldSchema: discriminatorSchema ? findDiscriminatorField(schema, options, discriminatorSchema.propertyName) : null,
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
        if (deepEquals(this.cleanDiscriminatorSchema(discSchema), componentSchemas[componentKey])) {
          options.push({
            label: componentKey,
            value: componentKey
          });
        }
      }
    }

    return options;
  }

  findEnumOptionsIndex(enumOptions, value) {
    return enumOptions.findIndex((item) => item.value === value);
  }

  /**
   * Notifies the onChange prop that the selected index has changed.
   *
   * Note that this is the index and not the value
   */
  notifyOptionSelection = (selectedIndex) => {
    const { formData, onChange, options, registry } = this.props;
    const { rootSchema } = registry;
    // Update the formData so the example code is properly rendered and ensure defaults are applied if applicable
    // Note: defaults might not be applicable, this line largely from the original multischema code!
    onChange(getDefaultFormState(options[selectedIndex], formData, rootSchema));
  }

  /**
   * Handles the dropdown selection of your schema.
   *
   * The selectedValue is the selection value not the index.
   */
  onOptionChange = (selectedValue) => {
    const { formData } = this.props;
    const { discriminatorSchema, enumOptions } = this.state;
    const selectedOption = this.findEnumOptionsIndex(enumOptions, selectedValue);

    if (discriminatorSchema) {
      formData[discriminatorSchema.propertyName] = selectedValue;
    }

    this.notifyOptionSelection(selectedOption)

    this.setState({
      selectedOption,
      selectedValue
    });
  };

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

    // We've got a custom path if there's a discriminator, otherwise we fall back ot the old multischema field
    if (discriminatorSchema) {
      // Find which schema we wnat to render by looking at the options prop. The order of these options matches the order of the
      // dropdown options, and so we can just stick with matching indicies.
      const option = options[selectedOption] || null;
      let optionSchema;

      // This is from the original multiSchema, not completely sure what edge case it is addressing. Technically the schemafield still should fail with a null optionSchema
      if (option) {
        // If the subschema doesn't declare a type, infer the type from the
        // parent schema
        optionSchema = option.type ? option : { ...option, type: baseType };
      }

      // Define the values, force a selecte element and forward the remaining uiSchema object.
      let selectUiSchema = {'ui:options': {'enumOptions': enumOptions, 'hideEmpty': true}, 'ui:widget': 'select', ...uiSchema};

      uiSchema[discriminatorSchema.propertyName] = {
        'ui:widget': 'hidden',
        'ui:customTemplate': false
      };

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