const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');

const BaseArrayField = require('react-jsonschema-form/lib/components/fields/ArrayField').default;

function createArrayField(oas) {
  const explorerEnabled = oas[extensions.EXPLORER_ENABLED];

  function ArrayField(props) {
    let uiSchema;
    if (!explorerEnabled) {
      const uiOptions = {
        readOnly: true,
        addable: true,
      };

      // If the user has added a new entry within this ArrayField, disable any future entries from
      // being added while the explorer is in readOnly mode.
      // https://github.com/readmeio/api-explorer/pull/259#pullrequestreview-272110359
      if (props.formData.length > 0) {
        uiOptions.addable = false;
      }

      uiSchema = Object.assign(props.uiSchema, { 'ui:options': uiOptions });
    }

    return <BaseArrayField {...props} uiSchema={uiSchema || props.uiSchema} />;
  }

  ArrayField.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    formData: PropTypes.any,
    uiSchema: PropTypes.shape({}).isRequired,
  };

  ArrayField.defaultProps = {
    formData: [],
  };

  return ArrayField;
}

module.exports = createArrayField;
