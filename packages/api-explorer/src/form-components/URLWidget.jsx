const PropTypes = require('prop-types');

const URLWidget = require('@readme/react-jsonschema-form/lib/components/widgets/URLWidget').default;

function createURLWidget(explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return URLWidget;
}

URLWidget.propTypes = {
  explorerEnabled: PropTypes.bool,
};

module.exports = createURLWidget;
