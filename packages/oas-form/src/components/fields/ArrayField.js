import AddButton from '../AddButton';
import IconButton from '../IconButton';
import React, { Component } from 'react';
import * as types from '../../types';

import {
  getWidget,
  getDefaultFormState,
  getUiOptions,
  isMultiSelect,
  isFilesArray,
  isFixedItems,
  allowAdditionalItems,
  optionsList,
  retrieveSchema,
  toIdSchema,
  getDefaultRegistry,
} from '../../utils';
import { nanoid } from 'nanoid';

function ArrayFieldTitle({ TitleField, idSchema, title, required }) {
  if (!title) {
    return null;
  }
  const id = `${idSchema.$id}__title`;
  return <TitleField id={id} required={required} title={title} />;
}

function ArrayFieldDescription({ DescriptionField, idSchema, description }) {
  if (!description) {
    return null;
  }
  const id = `${idSchema.$id}__description`;
  return <DescriptionField description={description} id={id} />;
}

// Used in the two templates
function DefaultArrayItem(props) {
  const btnStyle = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold',
  };
  return (
    <div key={props.key} className={props.className}>
      <div className={props.hasToolbar ? 'col-xs-9' : 'col-xs-12'}>{props.children}</div>

      {props.hasToolbar && (
        <div className="col-xs-3 array-item-toolbox">
          <div
            className="btn-group"
            style={{
              display: 'flex',
              justifyContent: 'space-around',
            }}
          >
            {props.hasRemove && (
              <IconButton
                className="array-item-remove"
                disabled={props.disabled || props.readonly}
                icon="remove"
                onClick={props.onDropIndexClick(props.index)}
                style={btnStyle}
                tabIndex="-1"
                type="danger"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DefaultFixedArrayFieldTemplate(props) {
  return (
    <fieldset className={props.className} id={props.idSchema.$id}>
      <ArrayFieldTitle
        key={`array-field-title-${props.idSchema.$id}`}
        idSchema={props.idSchema}
        required={props.required}
        title={props.uiSchema['ui:title'] || props.title}
        TitleField={props.TitleField}
      />

      {(props.uiSchema['ui:description'] || props.schema.description) && (
        <div key={`field-description-${props.idSchema.$id}`} className="field-description">
          {props.uiSchema['ui:description'] || props.schema.description}
        </div>
      )}

      <div key={`array-item-list-${props.idSchema.$id}`} className="row array-item-list">
        {props.items && props.items.map(DefaultArrayItem)}
      </div>

      {props.canAdd && (
        <AddButton className="array-item-add" disabled={props.disabled || props.readonly} onClick={props.onAddClick} />
      )}
    </fieldset>
  );
}

function DefaultNormalArrayFieldTemplate(props) {
  return (
    <fieldset className={props.className} id={props.idSchema.$id}>
      <ArrayFieldTitle
        key={`array-field-title-${props.idSchema.$id}`}
        idSchema={props.idSchema}
        required={props.required}
        title={props.uiSchema['ui:title'] || props.title}
        TitleField={props.TitleField}
      />

      {(props.uiSchema['ui:description'] || props.schema.description) && (
        <ArrayFieldDescription
          key={`array-field-description-${props.idSchema.$id}`}
          description={props.uiSchema['ui:description'] || props.schema.description}
          DescriptionField={props.DescriptionField}
          idSchema={props.idSchema}
        />
      )}

      <div key={`array-item-list-${props.idSchema.$id}`} className="row array-item-list">
        {props.items && props.items.map(p => DefaultArrayItem(p))}
      </div>

      {props.canAdd && (
        <AddButton className="array-item-add" disabled={props.disabled || props.readonly} onClick={props.onAddClick} />
      )}
    </fieldset>
  );
}

function generateRowId() {
  return nanoid();
}

function generateKeyedFormData(formData) {
  return !Array.isArray(formData)
    ? []
    : formData.map(item => {
        return {
          key: generateRowId(),
          item,
        };
      });
}

function keyedToPlainFormData(keyedFormData) {
  return keyedFormData.map(keyedItem => keyedItem.item);
}

class ArrayField extends Component {
  static defaultProps = {
    autofocus: false,
    disabled: false,
    formData: [],
    idSchema: {},
    readonly: false,
    required: false,
    uiSchema: {},
  };

  constructor(props) {
    super(props);
    const { formData } = props;
    const keyedFormData = generateKeyedFormData(formData);
    this.state = {
      keyedFormData,
      updatedKeyedFormData: false,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Don't call getDerivedStateFromProps if keyed formdata was just updated.
    if (prevState.updatedKeyedFormData) {
      return {
        updatedKeyedFormData: false,
      };
    }
    const nextFormData = nextProps.formData;
    const previousKeyedFormData = prevState.keyedFormData;
    const newKeyedFormData =
      nextFormData.length === previousKeyedFormData.length
        ? previousKeyedFormData.map((previousKeyedFormDatum, index) => {
            return {
              key: previousKeyedFormDatum.key,
              item: nextFormData[index],
            };
          })
        : generateKeyedFormData(nextFormData);
    return {
      keyedFormData: newKeyedFormData,
    };
  }

  get itemTitle() {
    const { schema } = this.props;
    return schema.items.title || schema.items.description || 'Item';
  }

  isItemRequired(itemSchema) {
    if (Array.isArray(itemSchema.type)) {
      // While we don't yet support composite/nullable jsonschema types, it's
      // future-proof to check for requirement against these.
      return !itemSchema.type.includes('null');
    }
    // All non-null array item types are inherently required by design
    return itemSchema.type !== 'null';
  }

  canAddItem(formItems) {
    const { schema, uiSchema } = this.props;
    let { addable } = getUiOptions(uiSchema);
    if (addable !== false) {
      // if ui:options.addable was not explicitly set to false, we can add
      // another item if we have not exceeded maxItems yet
      if (schema.maxItems !== undefined) {
        addable = formItems.length < schema.maxItems;
      } else {
        addable = true;
      }
    }
    return addable;
  }

  _getNewFormDataRow = () => {
    const { schema, registry = getDefaultRegistry() } = this.props;
    const { rootSchema } = registry;
    let itemSchema = schema.items;
    if (isFixedItems(schema) && allowAdditionalItems(schema)) {
      itemSchema = schema.additionalItems;
    }
    return getDefaultFormState(itemSchema, undefined, rootSchema);
  };

  onAddClick = event => {
    event.preventDefault();

    const { onChange } = this.props;
    const newKeyedFormDataRow = {
      key: generateRowId(),
      item: this._getNewFormDataRow(),
    };
    const newKeyedFormData = [...this.state.keyedFormData, newKeyedFormDataRow];
    this.setState(
      {
        keyedFormData: newKeyedFormData,
        updatedKeyedFormData: true,
      },
      () => onChange(keyedToPlainFormData(newKeyedFormData))
    );
  };

  onAddIndexClick = index => {
    return event => {
      if (event) {
        event.preventDefault();
      }
      const { onChange } = this.props;
      const newKeyedFormDataRow = {
        key: generateRowId(),
        item: this._getNewFormDataRow(),
      };
      const newKeyedFormData = [...this.state.keyedFormData];
      newKeyedFormData.splice(index, 0, newKeyedFormDataRow);

      this.setState(
        {
          keyedFormData: newKeyedFormData,
          updatedKeyedFormData: true,
        },
        () => onChange(keyedToPlainFormData(newKeyedFormData))
      );
    };
  };

  onDropIndexClick = index => {
    return event => {
      if (event) {
        event.preventDefault();
      }
      const { onChange } = this.props;
      const { keyedFormData } = this.state;

      const newKeyedFormData = keyedFormData.filter((_, i) => i !== index);
      this.setState(
        {
          keyedFormData: newKeyedFormData,
          updatedKeyedFormData: true,
        },
        () => onChange(keyedToPlainFormData(newKeyedFormData))
      );
    };
  };

  onChangeForIndex = index => {
    return value => {
      const { formData, onChange } = this.props;
      const newFormData = formData.map((item, i) => {
        // We need to treat undefined items as nulls to have validation.
        // See https://github.com/tdegrunt/jsonschema/issues/206
        const jsonValue = typeof value === 'undefined' ? null : value;
        return index === i ? jsonValue : item;
      });
      onChange(newFormData);
    };
  };

  onSelectChange = value => {
    this.props.onChange(value);
  };

  render() {
    const { schema, uiSchema, idSchema, registry = getDefaultRegistry() } = this.props;
    const { rootSchema } = registry;
    if (!schema.hasOwnProperty('items')) {
      const { fields } = registry;
      const { UnsupportedField } = fields;

      return <UnsupportedField idSchema={idSchema} reason="Missing items definition" schema={schema} />;
    }
    if (isFixedItems(schema)) {
      return this.renderFixedArray();
    }
    if (isFilesArray(schema, uiSchema, rootSchema)) {
      return this.renderFiles();
    }
    if (isMultiSelect(schema, rootSchema)) {
      return this.renderMultiSelect();
    }
    return this.renderNormalArray();
  }

  renderNormalArray() {
    const {
      schema,
      uiSchema,
      idSchema,
      name,
      required,
      disabled,
      readonly,
      autofocus,
      registry = getDefaultRegistry(),
      onBlur,
      onFocus,
      idPrefix,
    } = this.props;
    const title = schema.title === undefined ? name : schema.title;
    const { ArrayFieldTemplate, rootSchema, fields, formContext } = registry;
    const { TitleField, DescriptionField } = fields;
    const itemsSchema = retrieveSchema(schema.items, rootSchema);
    const formData = keyedToPlainFormData(this.state.keyedFormData);
    const arrayProps = {
      canAdd: this.canAddItem(formData),
      items: this.state.keyedFormData.map((keyedItem, index) => {
        const { key, item } = keyedItem;
        const itemSchema = retrieveSchema(schema.items, rootSchema, item);
        const itemIdPrefix = `${idSchema.$id}_${index}`;
        const itemIdSchema = toIdSchema(itemSchema, itemIdPrefix, rootSchema, item, idPrefix);
        return this.renderArrayFieldItem({
          key,
          index,
          itemSchema,
          itemIdSchema,
          itemData: item,
          itemUiSchema: uiSchema.items,
          autofocus: autofocus && index === 0,
          onBlur,
          onFocus,
        });
      }),
      className: `field field-array field-array-of-${itemsSchema.type}`,
      DescriptionField,
      disabled,
      idSchema,
      uiSchema,
      onAddClick: this.onAddClick,
      readonly,
      required,
      schema,
      title,
      TitleField,
      formContext,
      formData,
      registry,
    };

    // Check if a custom render function was passed in
    const Comp = uiSchema['ui:ArrayFieldTemplate'] || ArrayFieldTemplate || DefaultNormalArrayFieldTemplate;
    return <Comp {...arrayProps} />;
  }

  renderMultiSelect() {
    const {
      schema,
      idSchema,
      uiSchema,
      formData,
      disabled,
      readonly,
      required,
      label,
      placeholder,
      autofocus,
      onBlur,
      onFocus,
      registry = getDefaultRegistry(),
    } = this.props;
    const items = this.props.formData;
    const { widgets, rootSchema, formContext } = registry;
    const itemsSchema = retrieveSchema(schema.items, rootSchema, formData);
    const enumOptions = optionsList(itemsSchema);
    const { widget = 'select', ...options } = {
      ...getUiOptions(uiSchema),
      enumOptions,
    };
    const Widget = getWidget(schema, widget, widgets);
    return (
      <Widget
        autofocus={autofocus}
        disabled={disabled}
        formContext={formContext}
        id={idSchema && idSchema.$id}
        label={label}
        multiple
        onBlur={onBlur}
        onChange={this.onSelectChange}
        onFocus={onFocus}
        options={options}
        placeholder={placeholder}
        readonly={readonly}
        registry={registry}
        required={required}
        schema={schema}
        value={items}
      />
    );
  }

  renderFiles() {
    const {
      schema,
      uiSchema,
      idSchema,
      name,
      disabled,
      readonly,
      autofocus,
      onBlur,
      onFocus,
      registry = getDefaultRegistry(),
    } = this.props;
    const title = schema.title || name;
    const items = this.props.formData;
    const { widgets, formContext } = registry;
    const { widget = 'files', ...options } = getUiOptions(uiSchema);
    const Widget = getWidget(schema, widget, widgets);
    return (
      <Widget
        autofocus={autofocus}
        disabled={disabled}
        formContext={formContext}
        id={idSchema && idSchema.$id}
        multiple
        onBlur={onBlur}
        onChange={this.onSelectChange}
        onFocus={onFocus}
        options={options}
        readonly={readonly}
        schema={schema}
        title={title}
        value={items}
      />
    );
  }

  renderFixedArray() {
    const {
      schema,
      uiSchema,
      formData,
      idPrefix,
      idSchema,
      name,
      required,
      disabled,
      readonly,
      autofocus,
      registry = getDefaultRegistry(),
      onBlur,
      onFocus,
    } = this.props;
    const title = schema.title || name;
    let items = this.props.formData;
    const { ArrayFieldTemplate, rootSchema, fields, formContext } = registry;
    const { TitleField } = fields;
    const itemSchemas = schema.items.map((item, index) => retrieveSchema(item, rootSchema, formData[index]));
    const additionalSchema = allowAdditionalItems(schema)
      ? retrieveSchema(schema.additionalItems, rootSchema, formData)
      : null;

    if (!items || items.length < itemSchemas.length) {
      // to make sure at least all fixed items are generated
      items = items || [];
      items = items.concat(new Array(itemSchemas.length - items.length));
    }

    // These are the props passed into the render function
    const arrayProps = {
      canAdd: this.canAddItem(items) && additionalSchema,
      className: 'field field-array field-array-fixed-items',
      disabled,
      idSchema,
      formData,
      items: this.state.keyedFormData.map((keyedItem, index) => {
        const { key, item } = keyedItem;
        const additional = index >= itemSchemas.length;
        const itemSchema = additional ? retrieveSchema(schema.additionalItems, rootSchema, item) : itemSchemas[index];
        const itemIdPrefix = `${idSchema.$id}_${index}`;
        const itemIdSchema = toIdSchema(itemSchema, itemIdPrefix, rootSchema, item, idPrefix);
        const itemUiSchema = additional
          ? uiSchema.additionalItems || {}
          : Array.isArray(uiSchema.items) // eslint-disable-line unicorn/no-nested-ternary
          ? uiSchema.items[index]
          : uiSchema.items || {};

        return this.renderArrayFieldItem({
          key,
          index,
          canRemove: additional,
          itemSchema,
          itemData: item,
          itemUiSchema,
          itemIdSchema,
          autofocus: autofocus && index === 0,
          onBlur,
          onFocus,
        });
      }),
      onAddClick: this.onAddClick,
      readonly,
      required,
      schema,
      uiSchema,
      title,
      TitleField,
      formContext,
    };

    // Check if a custom template template was passed in
    const Template = uiSchema['ui:ArrayFieldTemplate'] || ArrayFieldTemplate || DefaultFixedArrayFieldTemplate;
    return <Template {...arrayProps} />;
  }

  renderArrayFieldItem(props) {
    let { itemSchema } = props;
    const { key, index, canRemove = true, itemData, itemUiSchema, itemIdSchema, autofocus, onBlur, onFocus } = props;
    const { disabled, readonly, uiSchema, registry = getDefaultRegistry() } = this.props;
    const {
      fields: { SchemaField },
    } = registry;
    const { removable } = {
      removable: true,
      ...uiSchema['ui:options'],
    };
    const has = {
      remove: removable && canRemove,
    };
    has.toolbar = Object.keys(has).some(k => has[k]);

    // If we have an array with either an empty `items` declaration (eg. `items: {}`), we should be able to handle
    // that as just a standard mixed type input.
    if (typeof itemSchema === 'object' && itemSchema !== null && Object.keys(itemSchema).length === 0) {
      itemSchema = {
        type: 'string',
      };
    }

    return {
      children: (
        <SchemaField
          autofocus={autofocus}
          disabled={this.props.disabled}
          formData={itemData}
          idSchema={itemIdSchema}
          index={index}
          onBlur={onBlur}
          onChange={this.onChangeForIndex(index)}
          onFocus={onFocus}
          readonly={this.props.readonly}
          registry={this.props.registry}
          required={this.isItemRequired(itemSchema)}
          schema={itemSchema}
          uiSchema={itemUiSchema}
        />
      ),
      className: 'array-item',
      disabled,
      hasToolbar: has.toolbar,
      hasRemove: has.remove,
      index,
      key,
      onAddIndexClick: this.onAddIndexClick,
      onDropIndexClick: this.onDropIndexClick,
      readonly,
    };
  }
}

if (process.env.NODE_ENV !== 'production') {
  ArrayField.propTypes = types.fieldProps;
}

export default ArrayField;
