const extensions = require('@readme/oas-extensions');

const BaseInput = require('react-jsonschema-form/lib/components/widgets/BaseInput').default;

function createBaseInput(oas) {
  const explorerEnabled = oas[extensions.EXPLORER_ENABLED];

  if (!explorerEnabled) {
    return () => { return null; };
  };

  return BaseInput;
}

module.exports = createBaseInput;
