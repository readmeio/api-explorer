const BaseInput = require('@readme/react-jsonschema-form/lib/components/widgets/BaseInput').default;

function createBaseInput(explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return BaseInput;
}

module.exports = createBaseInput;
