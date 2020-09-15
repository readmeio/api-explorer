const extensions = require('@readme/oas-extensions');

const TextareaWidget = require('@readme/react-jsonschema-form/lib/components/widgets/TextareaWidget').default;

function createTextareaWidget(oas, explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return TextareaWidget;
}

module.exports = createTextareaWidget;
