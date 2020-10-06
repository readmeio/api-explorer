const React = require('react');
const PropTypes = require('prop-types');

const BaseArrayField = require('@readme/react-jsonschema-form/lib/components/fields/ArrayField').default;
const { getDefaultRegistry, retrieveSchema } = require('@readme/react-jsonschema-form/lib/utils');

function createArrayField(explorerEnabled) {
  function hasPrimitives(props) {
    const { schema, registry = getDefaultRegistry() } = props;
    const { rootSchema } = registry;

    const itemsSchema = retrieveSchema(schema.items, rootSchema);

    return itemsSchema.type !== 'array' && itemsSchema.type !== 'object';
  }

  function ArrayField(props) {
    let uiSchema;
    if (!explorerEnabled) {
      const uiOptions = {
        readOnly: true,
        addable: true,
      };

      // Two scenarios are accounted for here: if the array contains only primitives, and if the
      // user has added a new entry within this ArrayField. For both scenarios, we want to disable
      // any future entires from being added while the explorer is in readOnly mode.
      //
      // Why? If the array contains only primitives, expanding the array will result in a less than
      // ideal UX of empty whitespace being added into view. As for if the user has already added
      // an item into view, we want to disable further items from being added as since the explorer
      // is in read-only mode, adding more items into view will just clutter up the view for the
      // user.
      //
      // https://github.com/readmeio/api-explorer/pull/259#pullrequestreview-272110359
      if (hasPrimitives(props)) {
        uiOptions.addable = false;
      } else if (props.formData.length > 0) {
        uiOptions.addable = false;
      }

      uiSchema = Object.assign(props.uiSchema, { 'ui:options': uiOptions });
    }

    return <BaseArrayField {...props} uiSchema={uiSchema || props.uiSchema} />;
  }

  ArrayField.propTypes = {
    explorerEnabled: PropTypes.bool,
    formData: PropTypes.any,
    uiSchema: PropTypes.shape({}).isRequired,
  };

  ArrayField.defaultProps = {
    formData: [],
  };

  return ArrayField;
}

module.exports = createArrayField;
