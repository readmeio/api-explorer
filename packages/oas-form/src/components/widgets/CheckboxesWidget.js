import React from 'react';
import PropTypes from 'prop-types';

function selectValue(value, selected, all) {
  const at = all.indexOf(value);
  const updated = selected.slice(0, at).concat(value, selected.slice(at));
  // As inserting values at predefined index positions doesn't work with empty
  // arrays, we need to reorder the updated selection to match the initial order
  return updated.sort((a, b) => all.indexOf(a) > all.indexOf(b));
}

function deselectValue(value, selected) {
  return selected.filter(v => v !== value);
}

function CheckboxesWidget(props) {
  const { id, disabled, options, value, autofocus, readonly, onChange } = props;
  const { enumOptions, enumDisabled, inline } = options;
  return (
    <div className="checkboxes" id={id}>
      {enumOptions.map((option, index) => {
        const checked = value.indexOf(option.value) !== -1;
        const itemDisabled = enumDisabled && enumDisabled.indexOf(option.value) !== -1;
        const disabledCls = disabled || itemDisabled || readonly ? 'disabled' : '';
        const checkbox = (
          <span>
            <input
              autoFocus={autofocus && index === 0}
              checked={checked}
              disabled={disabled || itemDisabled || readonly}
              id={`${id}_${index}`}
              onChange={event => {
                const all = enumOptions.map(({ value }) => value);
                if (event.target.checked) {
                  onChange(selectValue(option.value, value, all));
                } else {
                  onChange(deselectValue(option.value, value));
                }
              }}
              type="checkbox"
            />
            <span>{option.label}</span>
          </span>
        );
        return inline ? (
          <label key={index} className={`checkbox-inline ${disabledCls}`}>
            {checkbox}
          </label>
        ) : (
          <div key={index} className={`checkbox ${disabledCls}`}>
            <label>{checkbox}</label>
          </div>
        );
      })}
    </div>
  );
}

CheckboxesWidget.defaultProps = {
  autofocus: false,
  options: {
    inline: false,
  },
};

if (process.env.NODE_ENV !== 'production') {
  CheckboxesWidget.propTypes = {
    autofocus: PropTypes.bool,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
    onChange: PropTypes.func,
    options: PropTypes.shape({
      enumOptions: PropTypes.array,
      inline: PropTypes.bool,
    }).isRequired,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    schema: PropTypes.object.isRequired,
    value: PropTypes.any,
  };
}

export default CheckboxesWidget;
