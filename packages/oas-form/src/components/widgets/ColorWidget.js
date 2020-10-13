import React from 'react';
import PropTypes from 'prop-types';

function ColorWidget(props) {
  const {
    disabled,
    readonly,
    registry: {
      widgets: { BaseInput },
    },
  } = props;
  return <BaseInput type="color" {...props} disabled={disabled || readonly} />;
}

if (process.env.NODE_ENV !== 'production') {
  ColorWidget.propTypes = {
    autofocus: PropTypes.bool,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    schema: PropTypes.object.isRequired,
    value: PropTypes.string,
  };
}

export default ColorWidget;
