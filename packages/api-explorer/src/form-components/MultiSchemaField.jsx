const React = require('react');
const BaseMultiSchemaField = require('@readme/oas-form/src/components/fields/MultiSchemaField').default;
const fieldProps = require('@readme/oas-form/src/types').fieldProps;
const { getDefaultFormState, deepEquals } = require('@readme/oas-form/src/utils');

const Component = React.Component;
/**
 * Find the property that the discriminator is referencing.
 */
function findDiscriminatorField(schema, options, property) {
  if (schema.properties?.[property]) {
    return schema.properties[property];
  }

  // I need to return early, so I can't .forEach, wish I could use a for-of loop!
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
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
 * rjsf/oas-form adds an empty format field to the schema if there isn't one. We don't want that, to ensure we can
 * identify equality with the schema component
 */
function cleanDiscriminatorSchema(schema) {
  const copy = { ...schema };
  if (copy.format === '') {
    delete copy.format;
  }
  return copy;
}

/**
 * This is a fun one. So here we go.
 *
 * If we want to generate a list of options for the discriminator drop down, we look at the schemas in the oneOf/anyOf.
 * Unfortunately the "value" of the discriminator is the name of that schema as referenced in the components/schemas
 * list. This is unfortunate because by the time we recieve the schema in this code it has already been dereferenced and
 * we've lost the json pointer.
 *
 * The solution is to compare the schema objects in the oneOf/anyOf to everything in the components/schemas list and use
 * that to identify the names we should use.
 *
 * The final order of this is SUPER IMPORTANT, because the existing multischema component renders the options in the
 * numeric order of the schemas in the oneOf/anyOf. So we need the values to appear in that same order, otherwise you
 * might have a name render the wrong schema.
 *
 * If we wanted to drop the order requirement, we would need to investigate further the mix between the incoming
 * options, and the list of schemas we generate. Maybe we could store a key value pair of name=>schema, of valid
 * options, and rely exclusively on that for this entire file. It would probably clean this code up a little bit.
 */
function getSchemaOptions(discriminatorSchemas, componentSchemas) {
  const options = [];

  Object.keys(discriminatorSchemas).forEach(dsKey => {
    const discSchema = discriminatorSchemas[dsKey];
    Object.keys(componentSchemas).forEach(componentKey => {
      if (deepEquals(cleanDiscriminatorSchema(discSchema), componentSchemas[componentKey])) {
        options.push({
          label: componentKey,
          value: componentKey,
        });
      }
    });
  });

  return options;
}

/**
 * See getSchemaOptions for more thorough details. This basicaly does that, but uses the aliases in the mapping as
 * values instead of the schema keys
 */
function getMappingOptions(mapping, discriminatorSchemas, componentSchemas) {
  const validSchemas = {};

  // Get a list of valid schemas listed in the mapping and format it to look like its own component schema object, but
  // with the mapping keys instead of real keys so we can reuse getSchemaOptions.
  Object.keys(mapping).forEach(key => {
    const match = mapping[key].match(/#\/components\/schemas\/([^/]+)/);
    if (match && componentSchemas[match[1]]) {
      validSchemas[key] = componentSchemas[match[1]];
    }
  });

  return getSchemaOptions(discriminatorSchemas, validSchemas);
}

/**
 * Navigates a schema, trying to find the discriminator details
 */
function findDiscriminatorDetails(schema) {
  if (schema.discriminator) {
    return schema.discriminator;
  }

  // Sometimes discriminators are within each of the oneOf schemas, and not top level.
  if (schema?.oneOf) {
    // If the oneOf schemas has a discriminator, return that
    if (schema.oneOf?.[0]?.discriminator) {
      return schema?.oneOf?.[0]?.discriminator;
      // If the oneOf schema has an allOf for polymorphism, check that too for a discriminator
    } else if (schema.oneOf?.[0]?.allOf?.[0]?.discriminator) {
      return schema.oneOf[0].allOf[0].discriminator;
    }
  }

  // Sometimes discriminators are within each of the anyOf schemas, and not top level.
  if (schema?.anyOf) {
    // If the anyOf schemas has a discriminator, return that
    if (schema.anyOf?.[0]?.discriminator) {
      return schema?.anyOf?.[0]?.discriminator;
      // If the anyOf schema has an allOf for polymorphism, check that too for a discriminator
    } else if (schema.anyOf?.[0]?.allOf?.[0]?.discriminator) {
      return schema.anyOf[0].allOf[0].discriminator;
    }
  }

  // There is no allOf top level check because that implies there's no option, it's all the sub schemas.
  // Yes the subschema might have a discriminator, but multischemafield handles that with a nested multischemafield

  return false;
}

function findEnumOptionsIndex(enumOptions, value) {
  return enumOptions.findIndex(item => item.value === value);
}

/**
 * Notifies the onChange prop that the selected index has changed.
 *
 * Note that this is the index and not the value
 */
function notifySelectionValue(selectedIndex, selectedValue) {
  const { formData, onChange, options, registry } = this.props;
  const { rootSchema } = registry;
  const { discriminatorSchema } = this.state;

  if (discriminatorSchema) {
    formData[discriminatorSchema.propertyName] = selectedValue;
  }
  // Update the formData so the example code is properly rendered and ensure defaults are applied if applicable
  // Note: defaults might not be applicable, this line largely from the original multischema code!
  onChange(getDefaultFormState(options[selectedIndex], formData, rootSchema));
}

/**
 * Handles the dropdown selection of your schema.
 *
 * The selectedValue is the selection value not the index.
 */
function onOptionChange(selectedValue) {
  const { enumOptions } = this.state;
  const selectedIndex = findEnumOptionsIndex(enumOptions, selectedValue);

  this.setState({
    selectedIndex,
    selectedValue,
  });

  this.notifySelectionValue(selectedIndex, selectedValue);
}

class MultiSchemaField extends Component {
  constructor(props) {
    super(props);
    const { formData, options, schema, registry } = this.props;
    const { rootSchema } = registry;

    const discriminatorSchema = findDiscriminatorDetails(schema);
    let enumOptions = null;
    let initialSelectValue = null;
    let initialSelectIndex = null;

    this.notifySelectionValue = notifySelectionValue.bind(this);

    /**
     * Handles the dropdown selection of your schema.
     *
     * The selectedValue is the selection value not the index.
     */
    this.onOptionChange = onOptionChange.bind(this);

    if (discriminatorSchema) {
      // If there's a mapping that mapping defines the dropdown list
      if (discriminatorSchema.mapping) {
        enumOptions = getMappingOptions(discriminatorSchema.mapping, options, rootSchema.components?.schemas);
      } else {
        // If there isn't a mapping, the provided options define the dropdown list.
        const componentSchemas = rootSchema.components?.schemas;

        if (componentSchemas) {
          enumOptions = getSchemaOptions(options, componentSchemas);
        }
      }

      initialSelectValue = formData[discriminatorSchema.propertyName] || enumOptions[0].value;
      initialSelectIndex = findEnumOptionsIndex(enumOptions, initialSelectValue);
    }

    this.state = {
      selectedIndex: initialSelectIndex,
      selectedValue: initialSelectValue,
      discriminatorSchema,
      discriminatorFieldSchema: discriminatorSchema
        ? findDiscriminatorField(schema, options, discriminatorSchema.propertyName)
        : null,
      enumOptions,
    };

    if (discriminatorSchema) {
      this.notifySelectionValue(initialSelectIndex, initialSelectValue);
    }
  }

  render() {
    const {
      baseType,
      disabled,
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

    const SchemaField = registry.fields.SchemaField;
    const { selectedIndex, selectedValue, discriminatorSchema, discriminatorFieldSchema, enumOptions } = this.state;

    // We've got a custom path if there's a properly-formed discriminator, otherwise we fall back ot the old MultiSchema
    // field.
    if (discriminatorFieldSchema && discriminatorSchema) {
      // Find which schema we want to render by looking at the options prop. The order of these options matches the
      // order of the dropdown options, and so we can just stick with matching indicies.
      const option = options[selectedIndex] || null;
      let optionSchema;

      // This is from the original multiSchema, not completely sure what edge case it is addressing. Technically the
      // schemafield still should fail with a null optionSchema
      if (option) {
        // If the subschema doesn't declare a type, infer the type from the
        // parent schema
        optionSchema = option.type ? option : { ...option, type: baseType };
      }

      // Define the values, force a selecte element and forward the remaining uiSchema object.
      const selectUiSchema = {
        'ui:options': { enumOptions, hideEmpty: true },
        'ui:widget': 'select',
        ...uiSchema,
      };

      uiSchema[discriminatorSchema.propertyName] = {
        'ui:widget': 'hidden',
        'ui:customTemplate': false,
      };

      return (
        <div className="panel panel-default panel-body">
          <div className="form-group">
            <SchemaField
              disabled={disabled}
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
            <SchemaField
              disabled={disabled}
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

module.exports = function createMultiSchemaField() {
  return MultiSchemaField;
};
