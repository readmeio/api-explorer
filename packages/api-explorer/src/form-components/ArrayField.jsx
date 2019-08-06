const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');

const BaseArrayField = require('react-jsonschema-form/lib/components/fields/ArrayField').default;

function createArrayField(oas) {
  const explorerEnabled = oas[extensions.EXPLORER_ENABLED];

  function ArrayField(props) {
    let uiSchema;
    if (!explorerEnabled) {
      uiSchema = Object.assign(props.uiSchema, { 'ui:options': { readOnly: true } });
    }

    return <BaseArrayField {...props} uiSchema={uiSchema || props.uiSchema} />;
  }

  ArrayField.propTypes = {
    uiSchema: PropTypes.shape({}).isRequired,
  };

  return ArrayField;
}

module.exports = createArrayField;
