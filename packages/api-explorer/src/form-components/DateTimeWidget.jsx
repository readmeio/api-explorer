const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');

function createDateTimeWidget(oas) {
  const explorerEnabled = oas[extensions.EXPLORER_ENABLED];

  // Return a function that renders null when the explorer is disabled
  if (!explorerEnabled) return () => null;

  // Why use this instead of the DateTimeWidget that RJSF provides? Well that's running UTC conversion on dates that
  // doesn't actually need to happen for browsers that support `datetime-local`, and when it does that in browsers that
  // don't support it, it's overwriting the data that the user inputs with an empty string.
  function DateTimeWidget(props) {
    const {
      registry: {
        widgets: { BaseInput },
      },
    } = props;

    return <BaseInput type="datetime-local" {...props} />;
  }

  DateTimeWidget.propTypes = {
    registry: PropTypes.shape({
      FieldTemplate: PropTypes.func,
      rootSchema: PropTypes.object,
      widgets: PropTypes.object,
    }).isRequired,
  };

  return DateTimeWidget;
}

module.exports = createDateTimeWidget;
