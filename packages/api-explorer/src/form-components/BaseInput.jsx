const BaseInput = require('@readme/oas-form/src/components/widgets/BaseInput').default;

function createBaseInput(explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return BaseInput;
}

module.exports = createBaseInput;
