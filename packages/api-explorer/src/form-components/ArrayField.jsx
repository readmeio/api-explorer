const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@mia-platform/oas-extensions');

const BaseArrayField = require('react-jsonschema-form/lib/components/fields/ArrayField').default;

function createArrayField(oas) {
  const explorerEnabled = oas[extensions.EXPLORER_ENABLED];

  function ArrayField(props) {
    let uiSchema;
    if (!explorerEnabled) {
      // https://github.com/mozilla-services/react-jsonschema-form#addable-option
      uiSchema = Object.assign(props.uiSchema, { 'ui:options': { addable: false } });
    }

    return <BaseArrayField {...props} uiSchema={uiSchema || props.uiSchema} />;
  }

  ArrayField.propTypes = {
    uiSchema: PropTypes.shape({}).isRequired,
  };

  return ArrayField;
}

module.exports = createArrayField;
