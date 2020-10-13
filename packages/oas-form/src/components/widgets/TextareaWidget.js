import React from 'react';
import PropTypes from 'prop-types';

function TextareaWidget(props) {
  const { id, options, placeholder, value, required, disabled, readonly, autofocus, onChange, onBlur, onFocus } = props;
  const _onChange = ({ target: { value } }) => {
    return onChange(value === '' ? options.emptyValue : value);
  };
  return (
    <textarea
      autoFocus={autofocus}
      className="form-control"
      disabled={disabled}
      id={id}
      onBlur={onBlur && (event => onBlur(id, event.target.value))}
      onChange={_onChange}
      onFocus={onFocus && (event => onFocus(id, event.target.value))}
      placeholder={placeholder}
      readOnly={readonly}
      required={required}
      rows={options.rows}
      value={typeof value === 'undefined' ? '' : value}
    />
  );
}

TextareaWidget.defaultProps = {
  autofocus: false,
  options: {},
};

if (process.env.NODE_ENV !== 'production') {
  TextareaWidget.propTypes = {
    autofocus: PropTypes.bool,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    options: PropTypes.shape({
      rows: PropTypes.number,
    }),
    placeholder: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    schema: PropTypes.object.isRequired,
    value: PropTypes.string,
  };
}

export default TextareaWidget;
