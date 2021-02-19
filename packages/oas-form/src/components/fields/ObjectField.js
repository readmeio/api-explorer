import AddButton from '../AddButton';
import React, { Component } from 'react';
import * as types from '../../types';

import { retrieveSchema, getDefaultRegistry, getUiOptions, ADDITIONAL_PROPERTY_FLAG } from '../../utils';

function DefaultObjectFieldTemplate(props) {
  const canExpand = function canExpand() {
    const { formData, schema, uiSchema } = props;
    if (!schema.additionalProperties) {
      return false;
    }
    const { expandable } = getUiOptions(uiSchema);
    if (expandable === false) {
      return expandable;
    }
    // if ui:options.expandable was not explicitly set to false, we can add
    // another property if we have not exceeded maxProperties yet
    if (schema.maxProperties !== undefined) {
      return Object.keys(formData).length < schema.maxProperties;
    }
    return true;
  };

  const { TitleField, DescriptionField } = props;
  return (
    <fieldset id={props.idSchema.$id}>
      {(props.uiSchema['ui:title'] || props.title) && (
        <TitleField
          formContext={props.formContext}
          id={`${props.idSchema.$id}__title`}
          required={props.required}
          title={props.title || props.uiSchema['ui:title']}
        />
      )}
      {props.description && (
        <DescriptionField
          description={props.description}
          formContext={props.formContext}
          id={`${props.idSchema.$id}__description`}
        />
      )}
      {props.properties.map(prop => prop.content)}
      {canExpand() && (
        <AddButton
          className="object-property-expand"
          disabled={props.disabled || props.readonly}
          onClick={props.onAddClick(props.schema)}
        />
      )}
    </fieldset>
  );
}

class ObjectField extends Component {
  static defaultProps = {
    disabled: false,
    formData: {},
    idSchema: {},
    readonly: false,
    required: false,
    uiSchema: {},
  };

  state = {
    wasPropertyKeyModified: false,
    additionalProperties: {},
  };

  isRequired(name) {
    const schema = this.props.schema;
    return Array.isArray(schema.required) && schema.required.indexOf(name) !== -1;
  }

  onPropertyChange = (name, addedByAdditionalProperties = false) => {
    return value => {
      if (!value && addedByAdditionalProperties) {
        // Don't set value = undefined for fields added by
        // additionalProperties. Doing so removes them from the
        // formData, which causes them to completely disappear
        // (including the input field for the property name). Unlike
        // fields which are "mandated" by the schema, these fields can
        // be set to undefined by clicking a "delete field" button, so
        // set empty values to the empty string.
        value = '';
      }
      const newFormData = { ...this.props.formData, [name]: value };
      this.props.onChange(newFormData);
    };
  };

  onDropPropertyClick = key => {
    return event => {
      event.preventDefault();
      const { onChange, formData } = this.props;
      const copiedFormData = { ...formData };
      delete copiedFormData[key];
      onChange(copiedFormData);
    };
  };

  getAvailableKey = (preferredKey, formData) => {
    let index = 0;
    let newKey = preferredKey;
    while (formData.hasOwnProperty(newKey)) {
      newKey = `${preferredKey}-${++index}`;
    }
    return newKey;
  };

  onKeyChange = oldValue => {
    return value => {
      if (oldValue === value) {
        return;
      }

      value = this.getAvailableKey(value, this.props.formData);
      const newFormData = { ...this.props.formData };
      const newKeys = { [oldValue]: value };
      const keyValues = Object.keys(newFormData).map(key => {
        const newKey = newKeys[key] || key;
        return { [newKey]: newFormData[key] };
      });
      const renamedObj = Object.assign({}, ...keyValues);

      this.setState({ wasPropertyKeyModified: true });

      this.props.onChange(renamedObj);
    };
  };

  getDefaultValue(type) {
    switch (type) {
      case 'string':
        return 'New Value';
      case 'array':
        return [];
      case 'boolean':
        return false;
      case 'null':
        return null;
      case 'number':
        return 0;
      case 'object':
        return {};
      default:
        // We don't have a datatype for some reason (perhaps additionalProperties was true)
        return 'New Value';
    }
  }

  handleAddClick = schema => () => {
    let type = schema.additionalProperties.type;
    const newFormData = { ...this.props.formData };

    if (schema.additionalProperties.hasOwnProperty('$ref')) {
      const { registry = getDefaultRegistry() } = this.props;
      const refSchema = retrieveSchema(
        { $ref: schema.additionalProperties.$ref },
        registry.rootSchema,
        this.props.formData
      );

      type = refSchema.type;
    }

    newFormData[this.getAvailableKey('newKey', newFormData)] = this.getDefaultValue(type);

    this.props.onChange(newFormData);
  };

  render() {
    const {
      uiSchema,
      formData,
      idSchema,
      name,
      required,
      disabled,
      readonly,
      idPrefix,
      onBlur,
      onFocus,
      registry = getDefaultRegistry(),
    } = this.props;

    const { rootSchema, fields, formContext } = registry;
    const { SchemaField, TitleField, DescriptionField } = fields;
    const schema = retrieveSchema(this.props.schema, rootSchema, formData);

    // If this schema has a title defined, but the user has set a new key/label, retain their input.
    let title;
    if (this.state.wasPropertyKeyModified) {
      title = name;
    } else {
      title = schema.title === undefined ? name : schema.title;
    }

    const description = uiSchema['ui:description'] || schema.description;
    const properties = Object.keys(schema.properties || {});

    const Template = uiSchema['ui:ObjectFieldTemplate'] || registry.ObjectFieldTemplate || DefaultObjectFieldTemplate;

    const templateProps = {
      title: uiSchema['ui:title'] || title,
      description,
      TitleField,
      DescriptionField,
      properties: properties.map(prop => {
        const addedByAdditionalProperties = schema.properties[prop].hasOwnProperty(ADDITIONAL_PROPERTY_FLAG);
        return {
          content: (
            <SchemaField
              key={prop}
              disabled={disabled}
              formData={(formData || {})[prop]}
              idPrefix={idPrefix}
              idSchema={idSchema[prop]}
              name={prop}
              onBlur={onBlur}
              onChange={this.onPropertyChange(prop, addedByAdditionalProperties)}
              onDropPropertyClick={this.onDropPropertyClick}
              onFocus={onFocus}
              onKeyChange={this.onKeyChange(prop)}
              readonly={readonly}
              registry={registry}
              required={this.isRequired(prop)}
              schema={schema.properties[prop]}
              uiSchema={addedByAdditionalProperties ? uiSchema.additionalProperties : uiSchema[prop]}
              wasPropertyKeyModified={this.state.wasPropertyKeyModified}
            />
          ),
          prop,
          readonly,
          disabled,
          required,
        };
      }),
      readonly,
      disabled,
      required,
      idSchema,
      uiSchema,
      schema,
      formData,
      formContext,
    };
    return <Template {...templateProps} onAddClick={this.handleAddClick} />;
  }
}

if (process.env.NODE_ENV !== 'production') {
  ObjectField.propTypes = types.fieldProps;
}

export default ObjectField;
