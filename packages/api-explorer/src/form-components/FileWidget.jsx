const FileWidget = require('@readme/oas-form/lib/components/widgets/FileWidget').default;

function createFileWidget(explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return FileWidget;
}

module.exports = createFileWidget;
