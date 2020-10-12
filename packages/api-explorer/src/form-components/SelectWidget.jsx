const SelectWidget = require('@readme/oas-form/lib/components/widgets/SelectWidget').default;

function createSelectWidget(explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return SelectWidget;
}

module.exports = createSelectWidget;
