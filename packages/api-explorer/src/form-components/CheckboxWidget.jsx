// Modified version of https://github.com/mozilla-services/react-jsonschema-form/blob/158fd6465b46ba232864727a05704bf3708d2c5e/src/components/widgets/CheckboxWidget.js without Description
const React = require('react');
const PropTypes = require('prop-types');

function CheckboxWidget(props) {
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

CheckboxWidget.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.bool,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

CheckboxWidget.defaultProps = {
  value: false,
  disabled: false,
  readonly: false,
};

module.exports = CheckboxWidget;
