const PropTypes = require('prop-types');

const FileWidget = require('@readme/react-jsonschema-form/lib/components/widgets/FileWidget').default;

function createFileWidget(oas, explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return FileWidget;
}

FileWidget.propTypes = {
  explorerEnabled: PropTypes.bool,
};

module.exports = createFileWidget;
