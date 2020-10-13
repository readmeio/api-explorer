import React from 'react';
import PropTypes from 'prop-types';
import AltDateWidget from './AltDateWidget';

function AltDateTimeWidget(props) {
  const { AltDateWidget: Widget } = props.registry.widgets;
  return <Widget time {...props} />;
}

if (process.env.NODE_ENV !== 'production') {
  AltDateTimeWidget.propTypes = {
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    options: PropTypes.object,
    required: PropTypes.bool,
    schema: PropTypes.object.isRequired,
    value: PropTypes.string,
  };
}

AltDateTimeWidget.defaultProps = {
  ...AltDateWidget.defaultProps,
  time: true,
};

export default AltDateTimeWidget;
