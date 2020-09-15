const extensions = require('@readme/oas-extensions');

const SelectWidget = require('@readme/react-jsonschema-form/lib/components/widgets/SelectWidget').default;

function createSelectWidget(oas, explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return SelectWidget;
}

module.exports = createSelectWidget;
