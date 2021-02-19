import {
  ADDITIONAL_PROPERTY_FLAG,
  isMultiSelect,
  isSelect,
  isCyclic,
  retrieveSchema,
  toIdSchema,
  getDefaultRegistry,
  mergeObjects,
  getUiOptions,
  isFilesArray,
  deepEquals,
  getSchemaType,
} from '../../utils';
import IconButton from '../IconButton';
import React from 'react';
import PropTypes from 'prop-types';
import * as types from '../../types';

const REQUIRED_FIELD_SYMBOL = '*';
const COMPONENT_TYPES = {
  array: 'ArrayField',
  boolean: 'BooleanField',
  integer: 'NumberField',
  number: 'NumberField',
  object: 'ObjectField',
  string: 'StringField',
  null: 'NullField',
};

function getFieldComponent(schema, uiSchema, idSchema, fields) {
  const field = uiSchema['ui:field'];
  if (typeof field === 'function') {
    return field;
  }
  if (typeof field === 'string' && field in fields) {
    return fields[field];
  }

  const componentName = COMPONENT_TYPES[getSchemaType(schema)];

  // If the type is not defined and the schema uses 'anyOf' or 'oneOf', don't
  // render a field and let the MultiSchemaField component handle the form display
  if (!componentName && (schema.anyOf || schema.oneOf)) {
    return () => null;
  }

  return componentName in fields
    ? fields[componentName]
    : () => {
        const { UnsupportedField } = fields;

        return <UnsupportedField idSchema={idSchema} reason={`Unknown field type ${schema.type}`} schema={schema} />;
      };
}

function Label(props) {
  const { label, required, id } = props;
  if (!label) {
    return null;
  }
  return (
    <label className="control-label" htmlFor={id}>
      {label}
      {required && <span className="required">{REQUIRED_FIELD_SYMBOL}</span>}
    </label>
  );
}

function LabelInput(props) {
  const { id, label, onChange } = props;
  return (
    <input
      className="form-control"
      defaultValue={label}
      id={id}
      onBlur={event => onChange(event.target.value)}
      type="text"
    />
  );
}

function Help(props) {
  const { help } = props;
  if (!help) {
    return null;
  }
  if (typeof help === 'string') {
    return <p className="help-block">{help}</p>;
  }
  return <div className="help-block">{help}</div>;
}

function DefaultTemplate(props) {
  const { id, label, children, help, description, hidden, required, displayLabel } = props;
  if (hidden) {
    return <div className="hidden">{children}</div>;
  }

  return (
    <WrapIfAdditional {...props}>
      {displayLabel && <Label id={id} label={label} required={required} />}
      {displayLabel && description ? description : null}
      {children}
      {help}
    </WrapIfAdditional>
  );
}

if (process.env.NODE_ENV !== 'production') {
  DefaultTemplate.propTypes = {
    children: PropTypes.node.isRequired,
    classNames: PropTypes.string,
    description: PropTypes.element,
    displayLabel: PropTypes.bool,
    fields: PropTypes.object,
    formContext: PropTypes.object,
    help: PropTypes.element,
    hidden: PropTypes.bool,
    id: PropTypes.string,
    label: PropTypes.string,
    rawDescription: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    rawHelp: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    readonly: PropTypes.bool,
    required: PropTypes.bool,
  };
}

DefaultTemplate.defaultProps = {
  displayLabel: true,
  hidden: false,
  readonly: false,
  required: false,
};

function WrapIfAdditional(props) {
  const { id, classNames, disabled, label, onKeyChange, onDropPropertyClick, readonly, required, schema } = props;
  const keyLabel = `${label} Key`; // i18n ?
  const additional = schema.hasOwnProperty(ADDITIONAL_PROPERTY_FLAG);

  if (!additional) {
    return <div className={classNames}>{props.children}</div>;
  }

  return (
    <div className={classNames}>
      <div className="row">
        <div className="col-xs-5 form-additional">
          <div className="form-group">
            <Label id={`${id}-key`} label={keyLabel} required={required} />
            <LabelInput id={`${id}-key`} label={label} onChange={onKeyChange} required={required} />
          </div>
        </div>
        <div className="form-additional form-group col-xs-5">{props.children}</div>
        <div className="col-xs-2">
          <IconButton
            className="array-item-remove btn-block"
            disabled={disabled || readonly}
            icon="remove"
            onClick={onDropPropertyClick(label)}
            style={{ border: '0' }}
            tabIndex="-1"
            type="danger"
          />
        </div>
      </div>
    </div>
  );
}

function SchemaFieldRender(props) {
  const {
    uiSchema,
    formData,
    idPrefix,
    name,
    onKeyChange,
    onDropPropertyClick,
    required,
    registry = getDefaultRegistry(),
    wasPropertyKeyModified = false,
  } = props;
  const { rootSchema, fields, formContext } = registry;
  if (isCyclic(props.schema, rootSchema, { array: false })) {
    return null;
  }

  const FieldTemplate = uiSchema['ui:FieldTemplate'] || registry.FieldTemplate || DefaultTemplate;
  let idSchema = props.idSchema;
  const schema = retrieveSchema(props.schema, rootSchema, formData);

  idSchema = mergeObjects(toIdSchema(schema, null, rootSchema, formData, idPrefix), idSchema);

  const FieldComponent = getFieldComponent(schema, uiSchema, idSchema, fields);
  const { DescriptionField } = fields;
  const disabled = Boolean(props.disabled || uiSchema['ui:disabled']);
  const readonly = Boolean(props.readonly || uiSchema['ui:readonly'] || props.schema.readOnly || schema.readOnly);
  const autofocus = Boolean(props.autofocus || uiSchema['ui:autofocus']);
  if (Object.keys(schema).length === 0) {
    return null;
  }

  const uiOptions = getUiOptions(uiSchema);
  let { label: displayLabel = true } = uiOptions;
  if (schema.type === 'array') {
    displayLabel = isMultiSelect(schema, rootSchema) || isFilesArray(schema, uiSchema, rootSchema);
  }
  if (schema.type === 'object') {
    displayLabel = false;
  }
  if (schema.type === 'boolean' && !uiSchema['ui:widget']) {
    displayLabel = false;
  }
  if (uiSchema['ui:field']) {
    displayLabel = false;
  }

  // See #439: uiSchema: Don't pass consumed class names to child components
  const field = (
    <FieldComponent
      {...props}
      autofocus={autofocus}
      disabled={disabled}
      formContext={formContext}
      idSchema={idSchema}
      readonly={readonly}
      schema={schema}
      uiSchema={{ ...uiSchema, classNames: undefined }}
    />
  );

  const { type } = schema;
  const id = idSchema.$id;

  // If this schema has a title defined, but the user has set a new key/label, retain their input.
  let label;
  if (wasPropertyKeyModified) {
    label = name;
  } else {
    label = uiSchema['ui:title'] || props.schema.title || schema.title || name;
  }

  const description = uiSchema['ui:description'] || props.schema.description || schema.description;
  const help = uiSchema['ui:help'];
  const hidden = uiSchema['ui:widget'] === 'hidden';
  const classNames = ['form-group', 'field', `field-${type}`, uiSchema.classNames].join(' ').trim();

  const fieldProps = {
    description: <DescriptionField description={description} formContext={formContext} id={`${id}__description`} />,
    rawDescription: description,
    help: <Help help={help} />,
    rawHelp: typeof help === 'string' ? help : undefined,
    id,
    label,
    hidden,
    onKeyChange,
    onDropPropertyClick,
    required,
    disabled,
    readonly,
    displayLabel,
    classNames,
    formContext,
    fields,
    schema,
    uiSchema,
  };

  const _AnyOfField = registry.fields.AnyOfField;
  const _OneOfField = registry.fields.OneOfField;

  return (
    <FieldTemplate {...fieldProps}>
      {field}

      {/*
        If the schema `anyOf` or 'oneOf' can be rendered as a select control, don't
        render the selection and let `StringField` component handle
        rendering
      */}
      {schema.anyOf && !isSelect(schema) && (
        <_AnyOfField
          baseType={schema.type}
          disabled={disabled}
          formData={formData}
          idPrefix={idPrefix}
          idSchema={idSchema}
          onBlur={props.onBlur}
          onChange={props.onChange}
          onFocus={props.onFocus}
          options={schema.anyOf}
          registry={registry}
          schema={schema}
          uiSchema={uiSchema}
        />
      )}

      {schema.oneOf && !isSelect(schema) && (
        <_OneOfField
          baseType={schema.type}
          disabled={disabled}
          formData={formData}
          idPrefix={idPrefix}
          idSchema={idSchema}
          onBlur={props.onBlur}
          onChange={props.onChange}
          onFocus={props.onFocus}
          options={schema.oneOf}
          registry={registry}
          schema={schema}
          uiSchema={uiSchema}
        />
      )}
    </FieldTemplate>
  );
}

class SchemaField extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !deepEquals(this.props, nextProps);
  }

  render() {
    return SchemaFieldRender(this.props);
  }
}

SchemaField.defaultProps = {
  autofocus: false,
  disabled: false,
  idSchema: {},
  readonly: false,
  uiSchema: {},
};

if (process.env.NODE_ENV !== 'production') {
  SchemaField.propTypes = {
    formData: PropTypes.any,
    idSchema: PropTypes.object,
    registry: types.registry.isRequired,
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object,
  };
}

export default SchemaField;
