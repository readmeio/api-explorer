const PropTypes = require('prop-types');

const BaseInput = require('@readme/react-jsonschema-form/lib/components/widgets/BaseInput').default;

function createBaseInput(explorerEnabled) {
  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  return BaseInput;
}

BaseInput.propTypes = {
  explorerEnabled: PropTypes.bool,
};

module.exports = createBaseInput;
