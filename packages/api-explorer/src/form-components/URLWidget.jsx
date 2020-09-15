const extensions = require('@readme/oas-extensions');

const URLWidget = require('@readme/react-jsonschema-form/lib/components/widgets/URLWidget').default;

function createURLWidget(oas, explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return URLWidget;
}

module.exports = createURLWidget;
