const extensions = require('@readme/oas-extensions');

const FileWidget = require('@readme/react-jsonschema-form/lib/components/widgets/FileWidget').default;

function createFileWidget(oas, explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return FileWidget;
}

module.exports = createFileWidget;
