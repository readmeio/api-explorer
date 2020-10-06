const PropTypes = require('prop-types');

const SelectWidget = require('@readme/react-jsonschema-form/lib/components/widgets/SelectWidget').default;

function createSelectWidget(explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return SelectWidget;
}

SelectWidget.propTypes = {
  explorerEnabled: PropTypes.bool,
};

module.exports = createSelectWidget;
