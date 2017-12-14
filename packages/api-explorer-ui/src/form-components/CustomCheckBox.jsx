const React = require('react');
const PropTypes = require('prop-types');

function CustomCheckbox(props) {
  const { id, value, required, disabled, readonly, label, onChange } = props;
  return (
    <div className={`checkbox ${disabled || readonly ? 'disabled' : ''}`}>
      {
        // eslint-disable-next-line jsx-a11y/label-has-for
        <label>
          <input
            type="checkbox"
            id={id}
            checked={typeof value === 'undefined' ? false : value}
            required={required}
            disabled={disabled || readonly}
            onChange={event => onChange(event.target.checked)}
          />
          <span>{label}</span>
        </label>
      }
    </div>
  );
}

module.exports = CustomCheckbox;

CustomCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.bool,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

CustomCheckbox.defaultProps = {
  value: false,
  disabled: false,
  readonly: false,
};
