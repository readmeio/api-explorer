const React = require('react');
const extensions = require('@readme/oas-extensions');

const SchemaField = require('react-jsonschema-form/lib/components/fields/SchemaField').default;

function createSchemaField(oas) {
  const explorerEnabled = oas[extensions.EXPLORER_ENABLED];

  return function (props) {
    // if (!explorerEnabled) {
    //   props.uiSchema = Object.assign(props.uiSchema, { "ui:options": { addable: false }})
    // };

    if (props.schema.type === 'boolean') {
      props.schema.enumNames = ['true', 'false']
      return <SchemaField {...props} uiSchema={{ "ui:widget": "select" }} />
    }
    return <SchemaField {...props} />
  }
}

module.exports = createSchemaField;
