const React = require('react');
const PropTypes = require('prop-types');

function BaseInput(props) {
  // Note: since React 15.2.0 we can't forward unknown element attributes, so we
  // exclude the "options" and "schema" ones here.

  const {
    value,
    readonly,
    disabled,
    autofocus,
    onBlur,
    onFocus,
    options,
    schema,
    formContext,
    registry,
    ...inputProps
  } = props;

  inputProps.type = options.inputType || inputProps.type || 'text';
  const _onChange = ({ target: { value } }) => {
    return props.onChange(value === '' ? options.emptyValue : value);
  };
  return (
    <div className="param-item-table">
      <div className="param-item-desc" />
      <div className="param-item-input">
        <input
          className="form-control"
          readOnly={readonly}
          disabled={disabled}
          autoFocus={autofocus}
          value={value == null ? '' : value}
          {...inputProps}
          onChange={_onChange}
          onBlur={onBlur && (event => onBlur(inputProps.id, event.target.value))}
          onFocus={onFocus && (event => onFocus(inputProps.id, event.target.value))}
        />
      </div>
    </div>
  );
}

BaseInput.propTypes = {
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  autofocus: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
};

BaseInput.defaultProps = {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false,
  autofocus: false,
};

module.exports = BaseInput;
