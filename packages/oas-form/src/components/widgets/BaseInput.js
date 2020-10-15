import React from 'react';
import PropTypes from 'prop-types';

function BaseInput(props) {
  // Note: since React 15.2.0 we can't forward unknown element attributes, so we
  // exclude the "options" and "schema" ones here.
  if (!props.id) {
    console.log('No id for', props);
    throw new Error(`no id for props ${JSON.stringify(props)}`);
  }
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
    rawErrors,
    ...inputProps
  } = props;

  // If options.inputType is set use that as the input type
  if (options.inputType) {
    inputProps.type = options.inputType;
  } else if (!inputProps.type) {
    // If the schema is of type number or integer, set the input type to number
    if (schema.type === 'number') {
      inputProps.type = 'number';
      // Setting step to 'any' fixes a bug in Safari where decimals are not
      // allowed in number inputs
      inputProps.step = 'any';
    } else if (schema.type === 'integer') {
      inputProps.type = 'number';
      // Since this is integer, you always want to step up or down in multiples
      // of 1
      inputProps.step = '1';
    } else {
      inputProps.type = 'text';
    }
  }

  // If multipleOf is defined, use this as the step value. This mainly improves
  // the experience for keyboard users (who can use the up/down KB arrows).
  if (schema.multipleOf) {
    inputProps.step = schema.multipleOf;
  }

  if (typeof schema.minimum !== 'undefined') {
    inputProps.min = schema.minimum;
  }

  if (typeof schema.maximum !== 'undefined') {
    inputProps.max = schema.maximum;
  }

  const _onChange = ({ target: { value } }) => {
    return props.onChange(value === '' ? options.emptyValue : value);
  };

  return [
    <input
      key={inputProps.id}
      autoFocus={autofocus}
      className="form-control"
      disabled={disabled}
      readOnly={readonly}
      value={value == null ? '' : value}
      {...inputProps}
      list={schema.examples ? `examples_${inputProps.id}` : null}
      onBlur={onBlur && (event => onBlur(inputProps.id, event.target.value))}
      onChange={_onChange}
      onFocus={onFocus && (event => onFocus(inputProps.id, event.target.value))}
    />,
    schema.examples ? (
      <datalist id={`examples_${inputProps.id}`}>
        {[...new Set(schema.examples.concat(schema.default ? [schema.default] : []))].map(example => (
          <option key={example} value={example} />
        ))}
      </datalist>
    ) : null,
  ];
}

BaseInput.defaultProps = {
  autofocus: false,
  disabled: false,
  readonly: false,
  required: false,
};

if (process.env.NODE_ENV !== 'production') {
  BaseInput.propTypes = {
    autofocus: PropTypes.bool,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    placeholder: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    value: PropTypes.any,
  };
}

export default BaseInput;
