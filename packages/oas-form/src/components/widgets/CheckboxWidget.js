import React from 'react';
import PropTypes from 'prop-types';

// Check to see if a schema specifies that a value must be true
// eslint-disable-next-line consistent-return
function schemaRequiresTrueValue(schema) {
  // Check if const is a truthy value
  if (schema.const) {
    return true;
  }

  // Check if an enum has a single value of true
  if (schema.enum && schema.enum.length === 1 && schema.enum[0] === true) {
    return true;
  }

  // If anyOf has a single value, evaluate the subschema
  if (schema.anyOf && schema.anyOf.length === 1) {
    return schemaRequiresTrueValue(schema.anyOf[0]);
  }

  // If oneOf has a single value, evaluate the subschema
  if (schema.oneOf && schema.oneOf.length === 1) {
    return schemaRequiresTrueValue(schema.oneOf[0]);
  }

  // Evaluate each subschema in allOf, to see if one of them requires a true
  // value
  if (schema.allOf) {
    return schema.allOf.some(schemaRequiresTrueValue);
  }
}

function CheckboxWidget(props) {
  const {
    schema,
    id,
    value,
    disabled,
    readonly,
    label,
    autofocus,
    onBlur,
    onFocus,
    onChange,
    DescriptionField,
  } = props;

  // Because an unchecked checkbox will cause html5 validation to fail, only add
  // the "required" attribute if the field value must be "true", due to the
  // "const" or "enum" keywords
  const required = schemaRequiresTrueValue(schema);

  return (
    <div className={`checkbox ${disabled || readonly ? 'disabled' : ''}`}>
      {schema.description && <DescriptionField description={schema.description} />}
      <label>
        <input
          autoFocus={autofocus}
          checked={typeof value === 'undefined' ? false : value}
          disabled={disabled || readonly}
          id={id}
          onBlur={onBlur && (event => onBlur(id, event.target.checked))}
          onChange={event => onChange(event.target.checked)}
          onFocus={onFocus && (event => onFocus(id, event.target.checked))}
          required={required}
          type="checkbox"
        />
        <span>{label}</span>
      </label>
    </div>
  );
}

CheckboxWidget.defaultProps = {
  autofocus: false,
};

if (process.env.NODE_ENV !== 'production') {
  CheckboxWidget.propTypes = {
    autofocus: PropTypes.bool,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    schema: PropTypes.object.isRequired,
    value: PropTypes.bool,
  };
}

export default CheckboxWidget;
