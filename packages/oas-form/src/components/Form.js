import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  getDefaultFormState,
  retrieveSchema,
  shouldRender,
  toIdSchema,
  getDefaultRegistry,
  deepEquals,
  isObject,
} from '../utils';

export default class Form extends Component {
  static defaultProps = {
    disabled: false,
    uiSchema: {},
  };

  constructor(props) {
    super(props);
    this.state = this.getStateFromProps(props, props.formData);
    if (this.props.onChange && !deepEquals(this.state.formData, this.props.formData)) {
      this.props.onChange(this.state);
    }
    this.formElement = null;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextState = this.getStateFromProps(nextProps, nextProps.formData);
    if (
      !deepEquals(nextState.formData, nextProps.formData) &&
      !deepEquals(nextState.formData, this.state.formData) &&
      this.props.onChange
    ) {
      this.props.onChange(nextState);
    }
    this.setState(nextState);
  }

  getStateFromProps(props, inputFormData) {
    const schema = 'schema' in props ? props.schema : this.props.schema;
    const uiSchema = 'uiSchema' in props ? props.uiSchema : this.props.uiSchema;
    const edit = typeof inputFormData !== 'undefined';
    const rootSchema = schema;
    const formData = getDefaultFormState(schema, inputFormData, rootSchema);
    const retrievedSchema = retrieveSchema(schema, rootSchema, formData);
    const idSchema = toIdSchema(retrievedSchema, uiSchema['ui:rootFieldId'], rootSchema, formData, props.idPrefix);
    return {
      schema,
      uiSchema,
      idSchema,
      formData,
      edit,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldRender(this, nextProps, nextState);
  }

  onChange = formData => {
    if (isObject(formData) || Array.isArray(formData)) {
      const newState = this.getStateFromProps(this.props, formData);
      formData = newState.formData;
    }

    const state = { formData };

    this.setState(state, () => this.props.onChange && this.props.onChange(state));
  };

  onBlur = (...args) => {
    if (this.props.onBlur) {
      this.props.onBlur(...args);
    }
  };

  onFocus = (...args) => {
    if (this.props.onFocus) {
      this.props.onFocus(...args);
    }
  };

  onSubmit = event => {
    event.preventDefault();
    if (event.target !== event.currentTarget) {
      return;
    }

    event.persist();
    const newFormData = this.state.formData;

    this.setState({ formData: newFormData }, () => {
      if (this.props.onSubmit) {
        this.props.onSubmit({ ...this.state, formData: newFormData, status: 'submitted' }, event);
      }
    });
  };

  getRegistry() {
    // For BC, accept passed SchemaField and TitleField props and pass them to
    // the "fields" registry one.
    const { fields, widgets } = getDefaultRegistry();
    return {
      fields: { ...fields, ...this.props.fields },
      widgets: { ...widgets, ...this.props.widgets },
      ArrayFieldTemplate: this.props.ArrayFieldTemplate,
      ObjectFieldTemplate: this.props.ObjectFieldTemplate,
      FieldTemplate: this.props.FieldTemplate,
      definitions: this.props.schema.definitions || {},
      rootSchema: this.props.schema,
      formContext: this.props.formContext || {},
    };
  }

  submit() {
    if (this.formElement) {
      this.formElement.dispatchEvent(
        new CustomEvent('submit', {
          cancelable: true,
        })
      );
    }
  }

  render() {
    const {
      children,
      id,
      idPrefix,
      className,
      tagName,
      name,
      method,
      target,
      action,
      autoComplete,
      enctype,
      acceptcharset,
      disabled,
      formContext,
    } = this.props;

    const { schema, uiSchema, formData, idSchema } = this.state;
    const registry = this.getRegistry();
    const _SchemaField = registry.fields.SchemaField;
    const FormTag = tagName || 'form';

    return (
      <FormTag
        ref={form => {
          this.formElement = form;
        }}
        acceptCharset={acceptcharset}
        action={action}
        autoComplete={autoComplete}
        className={className || 'rjsf'}
        encType={enctype}
        id={id}
        method={method}
        name={name}
        onSubmit={this.onSubmit}
        target={target}
      >
        <_SchemaField
          disabled={disabled}
          formContext={formContext}
          formData={formData}
          idPrefix={idPrefix}
          idSchema={idSchema}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onFocus={this.onFocus}
          registry={registry}
          schema={schema}
          uiSchema={uiSchema}
        />
        {children || (
          <div>
            <button className="btn btn-info" type="submit">
              Submit
            </button>
          </div>
        )}
      </FormTag>
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  Form.propTypes = {
    acceptcharset: PropTypes.string,
    action: PropTypes.string,
    ArrayFieldTemplate: PropTypes.elementType,
    autoComplete: PropTypes.string,
    className: PropTypes.string,
    enctype: PropTypes.string,
    fields: PropTypes.objectOf(PropTypes.elementType),
    FieldTemplate: PropTypes.elementType,
    formContext: PropTypes.object,
    formData: PropTypes.any,
    id: PropTypes.string,
    method: PropTypes.string,
    name: PropTypes.string,
    ObjectFieldTemplate: PropTypes.elementType,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    schema: PropTypes.object.isRequired,
    tagName: PropTypes.elementType,
    target: PropTypes.string,
    uiSchema: PropTypes.object,
    widgets: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])),
  };
}
