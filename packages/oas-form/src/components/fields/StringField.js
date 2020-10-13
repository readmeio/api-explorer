import React from 'react';
import * as types from '../../types';

import { getWidget, getUiOptions, isSelect, optionsList, getDefaultRegistry, hasWidget } from '../../utils';

function StringField(props) {
  const {
    schema,
    name,
    uiSchema,
    idSchema,
    formData,
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    onBlur,
    onFocus,
    registry = getDefaultRegistry(),
    rawErrors,
  } = props;
  const { title, format } = schema;
  const { widgets, formContext } = registry;
  const enumOptions = isSelect(schema) && optionsList(schema);
  let defaultWidget = enumOptions ? 'select' : 'text';
  if (format && hasWidget(schema, format, widgets)) {
    defaultWidget = format;
  }
  const { widget = defaultWidget, placeholder = '', ...options } = getUiOptions(uiSchema);
  const Widget = getWidget(schema, widget, widgets);
  return (
    <Widget
      autofocus={autofocus}
      disabled={disabled}
      formContext={formContext}
      id={idSchema && idSchema.$id}
      label={title === undefined ? name : title}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      options={{ ...options, enumOptions }}
      placeholder={placeholder}
      rawErrors={rawErrors}
      readonly={readonly}
      registry={registry}
      required={required}
      schema={schema}
      value={formData}
    />
  );
}

if (process.env.NODE_ENV !== 'production') {
  StringField.propTypes = types.fieldProps;
}

StringField.defaultProps = {
  autofocus: false,
  disabled: false,
  readonly: false,
  uiSchema: {},
};

export default StringField;
