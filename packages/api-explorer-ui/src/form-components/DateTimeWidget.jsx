const React = require('react');
const PropTypes = require('prop-types');
const BaseInput = require('./BaseInput');

function fromJSONDate(jsonDate) {
  return jsonDate ? jsonDate.slice(0, 19) : '';
}

function toJSONDate(dateString) {
  if (dateString) {
    return new Date(dateString).toJSON();
  }
}

const CustomDateTimeWidget = props => {
  const { value, onChange } = props;
  return (
    <BaseInput
      type="datetime-local"
      {...props}
      value={fromJSONDate(value)}
      onChange={value => onChange(toJSONDate(value))}
    />
  );
};

if (process.env.NODE_ENV !== 'production') {
  CustomDateTimeWidget.propTypes = {
    value: PropTypes.string,
  };
}

export default CustomDateTimeWidget;
