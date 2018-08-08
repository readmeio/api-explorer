const extensions = require('@readme/oas-extensions');

const SelectWidget = require('react-jsonschema-form/lib/components/widgets/SelectWidget').default;

function createSelectWidget(oas) {
  const explorerEnabled = oas[extensions.EXPLORER_ENABLED];

  if (!explorerEnabled) {
    return () => { return null };
  };

  return SelectWidget;
}

module.exports = createSelectWidget;
