const extensions = require('@readme/oas-extensions');

const BaseInput = require('react-jsonschema-form/lib/components/widgets/BaseInput').default;

function createBaseInput(oas) {
  const explorerEnabled = oas[extensions.EXPLORER_ENABLED];

  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return BaseInput;
}

module.exports = createBaseInput;
