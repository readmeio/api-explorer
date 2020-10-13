import React from 'react';
import * as types from '../../types';

import { getWidget, getUiOptions, optionsList, getDefaultRegistry } from '../../utils';

function BooleanField(props) {
  const {
    schema,
    name,
    uiSchema,
    idSchema,
    formData,
    registry = getDefaultRegistry(),
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    onFocus,
    onBlur,
    rawErrors,
  } = props;
  const { title } = schema;
  const { widgets, formContext, fields } = registry;
  const { widget = 'checkbox', ...options } = getUiOptions(uiSchema);
  const Widget = getWidget(schema, widget, widgets);

  let enumOptions;

  if (Array.isArray(schema.oneOf)) {
    enumOptions = optionsList({
      oneOf: schema.oneOf.map(option => ({
        ...option,
        title: option.title || (option.const === true ? 'Yes' : 'No'),
      })),
    });
  } else {
    enumOptions = optionsList({
      enum: schema.enum || [true, false],
      enumNames: schema.enumNames || (schema.enum && schema.enum[0] === false ? ['No', 'Yes'] : ['Yes', 'No']),
    });
  }

  return (
    <Widget
      autofocus={autofocus}
      DescriptionField={fields.DescriptionField}
      disabled={disabled}
      formContext={formContext}
      id={idSchema && idSchema.$id}
      label={title === undefined ? name : title}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      options={{ ...options, enumOptions }}
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
  BooleanField.propTypes = types.fieldProps;
}

BooleanField.defaultProps = {
  autofocus: false,
  disabled: false,
  readonly: false,
  uiSchema: {},
};

export default BooleanField;
