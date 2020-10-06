const PropTypes = require('prop-types');

const TextareaWidget = require('@readme/react-jsonschema-form/lib/components/widgets/TextareaWidget').default;

function createTextareaWidget(explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return TextareaWidget;
}

TextareaWidget.propTypes = {
  explorerEnabled: PropTypes.bool,
};

module.exports = createTextareaWidget;
