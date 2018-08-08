const React = require('react');
const extensions = require('@readme/oas-extensions');

const ArrayField = require('react-jsonschema-form/lib/components/fields/ArrayField').default;

function createArrayField(oas) {
  const explorerEnabled = oas[extensions.EXPLORER_ENABLED];

  return function (props) {
    if (!explorerEnabled) {
      props.uiSchema = Object.assign(props.uiSchema, { "ui:options": { addable: false }})
    };

    return <ArrayField {...props} />;
  }
}

module.exports = createArrayField;
