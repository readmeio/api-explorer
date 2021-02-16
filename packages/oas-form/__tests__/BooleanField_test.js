import React from 'react';
import { Simulate } from 'react-dom/test-utils';

import { createFormComponent, submitForm } from './test_utils';

describe('BooleanField', () => {
  const CustomWidget = () => <div id="custom" />;

  it('should render a boolean field', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
      },
    });

    expect(node.querySelectorAll('.field input[type=checkbox]')).toHaveLength(1);
  });

  it('should render a boolean field with the expected id', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
      },
    });

    expect(node.querySelector('.field input[type=checkbox]').id).toBe('root');
  });

  it('should render a boolean field with a label', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        title: 'foo',
      },
    });

    expect(node.querySelector('.field label span')).toHaveTextContent('foo');
  });

  describe('HTML5 required attribute', () => {
    it('should not render a required attribute for simple required fields', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
            },
          },
          required: ['foo'],
        },
      });

      expect(node.querySelector('input[type=checkbox]')).not.toBeRequired();
    });

    it('should add a required attribute if the schema uses const with a true value', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              const: true,
            },
          },
        },
      });

      expect(node.querySelector('input[type=checkbox]')).toBeRequired();
    });

    it('should add a required attribute if the schema uses an enum with a single value of true', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              enum: [true],
            },
          },
        },
      });

      expect(node.querySelector('input[type=checkbox]')).toBeRequired();
    });

    it('should add a required attribute if the schema uses an anyOf with a single value of true', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              anyOf: [
                {
                  const: true,
                },
              ],
            },
          },
        },
      });

      expect(node.querySelector('input[type=checkbox]')).toBeRequired();
    });

    it('should add a required attribute if the schema uses a oneOf with a single value of true', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              oneOf: [
                {
                  const: true,
                },
              ],
            },
          },
        },
      });

      expect(node.querySelector('input[type=checkbox]')).toBeRequired();
    });

    it('should add a required attribute if the schema uses an allOf with a value of true', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              allOf: [
                {
                  const: true,
                },
              ],
            },
          },
        },
      });

      expect(node.querySelector('input[type=checkbox]')).toBeRequired();
    });
  });

  it('should render a single label', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        title: 'foo',
      },
    });

    expect(node.querySelectorAll('.field label')).toHaveLength(1);
  });

  it('should render a description', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        description: 'my description',
      },
    });

    const description = node.querySelector('.field-description');
    expect(description).toHaveTextContent('my description');
  });

  it('should render the description using provided description field', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        description: 'my description',
      },
      fields: {
        DescriptionField: ({ description }) => <div className="field-description">{description} overridden</div>,
      },
    });

    const description = node.querySelector('.field-description');
    expect(description).toHaveTextContent('my description overridden');
  });

  it('should assign a default value', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        default: true,
      },
    });

    expect(node.querySelector('.field input')).toBeChecked();
  });

  it('formData should default to undefined', () => {
    const { node, onSubmit } = createFormComponent({
      schema: { type: 'boolean' },
      noValidate: true,
    });
    submitForm(node);
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: undefined,
      }),
      expect.anything()
    );
  });

  it('should handle a change event', () => {
    const { node, onChange } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false,
      },
    });

    Simulate.change(node.querySelector('input'), {
      target: { checked: true },
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ formData: true }));
  });

  it('should fill field with data', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
      },
      formData: true,
    });

    expect(node.querySelector('.field input')).toBeChecked();
  });

  it('should render radio widgets with the expected id', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
      },
      uiSchema: { 'ui:widget': 'radio' },
    });

    expect(node.querySelector('.field-radio-group').id).toBe('root');
  });

  it('should have default enum option labels for radio widgets', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' },
    });

    const labels = [].map.call(node.querySelectorAll('.field-radio-group label'), label => label.textContent);
    expect(labels).toStrictEqual(['Yes', 'No']);
  });

  it('should support enum option ordering for radio widgets', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        enum: [false, true],
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' },
    });

    const labels = [].map.call(node.querySelectorAll('.field-radio-group label'), label => label.textContent);
    expect(labels).toStrictEqual(['No', 'Yes']);
  });

  it('should support enumNames for radio widgets', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        enumNames: ['Yes', 'No'],
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' },
    });

    const labels = [].map.call(node.querySelectorAll('.field-radio-group label'), label => label.textContent);
    expect(labels).toStrictEqual(['Yes', 'No']);
  });

  it('should support oneOf titles for radio widgets', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        oneOf: [
          {
            const: true,
            title: 'Yes',
          },
          {
            const: false,
            title: 'No',
          },
        ],
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' },
    });

    const labels = [].map.call(node.querySelectorAll('.field-radio-group label'), label => label.textContent);
    expect(labels).toStrictEqual(['Yes', 'No']);
  });

  it('should preserve oneOf option ordering for radio widgets', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        oneOf: [
          {
            const: false,
            title: 'No',
          },
          {
            const: true,
            title: 'Yes',
          },
        ],
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' },
    });

    const labels = [].map.call(node.querySelectorAll('.field-radio-group label'), label => label.textContent);
    expect(labels).toStrictEqual(['No', 'Yes']);
  });

  it('should support inline radio widgets', () => {
    const { node } = createFormComponent({
      schema: { type: 'boolean' },
      formData: true,
      uiSchema: {
        'ui:widget': 'radio',
        'ui:options': {
          inline: true,
        },
      },
    });

    expect(node.querySelectorAll('.radio-inline')).toHaveLength(2);
  });

  it('should handle a focus event for radio widgets', () => {
    const onFocus = jest.fn();
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false,
      },
      uiSchema: {
        'ui:widget': 'radio',
      },
      onFocus,
    });

    const element = node.querySelector('.field-radio-group');
    Simulate.focus(node.querySelector('input'), {
      target: {
        value: false,
      },
    });
    expect(onFocus).toHaveBeenCalledWith(element.id, false);
  });

  it('should handle a blur event for radio widgets', () => {
    const onBlur = jest.fn();
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false,
      },
      uiSchema: {
        'ui:widget': 'radio',
      },
      onBlur,
    });

    const element = node.querySelector('.field-radio-group');
    Simulate.blur(node.querySelector('input'), {
      target: {
        value: false,
      },
    });
    expect(onBlur).toHaveBeenCalledWith(element.id, false);
  });

  it('should support enumNames for select', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        enumNames: ['Yes', 'No'],
      },
      formData: true,
      uiSchema: { 'ui:widget': 'select' },
    });

    const labels = [].map.call(node.querySelectorAll('.field option'), label => label.textContent);
    expect(labels).toStrictEqual(['', 'Yes', 'No']);
  });

  it('should handle a focus event with select', () => {
    const onFocus = jest.fn();
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false,
      },
      uiSchema: {
        'ui:widget': 'select',
      },
      onFocus,
    });

    const element = node.querySelector('select');
    Simulate.focus(element, {
      target: {
        value: false,
      },
    });
    expect(onFocus).toHaveBeenCalledWith(element.id, false);
  });

  it('should handle a blur event with select', () => {
    const onBlur = jest.fn();
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false,
      },
      uiSchema: {
        'ui:widget': 'select',
      },
      onBlur,
    });

    const element = node.querySelector('select');
    Simulate.blur(element, {
      target: {
        value: false,
      },
    });
    expect(onBlur).toHaveBeenCalledWith(element.id, false);
  });

  it('should render the widget with the expected id', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
      },
    });

    expect(node.querySelector('input[type=checkbox]').id).toBe('root');
  });

  it('should render customized checkbox', () => {
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
      },
      widgets: {
        CheckboxWidget: CustomWidget,
      },
    });

    expect(node.querySelector('#custom')).not.toBeNull();
  });

  it('should handle a focus event with checkbox', () => {
    const onFocus = jest.fn();
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false,
      },
      uiSchema: {
        'ui:widget': 'checkbox',
      },
      onFocus,
    });

    const element = node.querySelector('input');
    Simulate.focus(element, {
      target: {
        checked: false,
      },
    });
    expect(onFocus).toHaveBeenCalledWith(element.id, false);
  });

  it('should handle a blur event with checkbox', () => {
    const onBlur = jest.fn();
    const { node } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false,
      },
      uiSchema: {
        'ui:widget': 'checkbox',
      },
      onBlur,
    });

    const element = node.querySelector('input');
    Simulate.blur(element, {
      target: {
        checked: false,
      },
    });
    expect(onBlur).toHaveBeenCalledWith(element.id, false);
  });

  describe('Label', () => {
    const Widget = props => <div id={`label-${props.label}`} />;

    const widgets = { Widget };

    it('should pass field name to widget if there is no title', () => {
      const schema = {
        type: 'object',
        properties: {
          boolean: {
            type: 'boolean',
          },
        },
      };
      const uiSchema = {
        boolean: {
          'ui:widget': 'Widget',
        },
      };

      const { node } = createFormComponent({ schema, widgets, uiSchema });
      expect(node.querySelector('#label-boolean')).not.toBeNull();
    });

    it('should pass schema title to widget', () => {
      const schema = {
        type: 'boolean',
        title: 'test',
      };
      const uiSchema = {
        'ui:widget': 'Widget',
      };

      const { node } = createFormComponent({ schema, widgets, uiSchema });
      expect(node.querySelector('#label-test')).not.toBeNull();
    });

    it('should pass empty schema title to widget', () => {
      const schema = {
        type: 'boolean',
        title: '',
      };
      const uiSchema = {
        'ui:widget': 'Widget',
      };
      const { node } = createFormComponent({ schema, widgets, uiSchema });
      expect(node.querySelector('#label-')).not.toBeNull();
    });
  });

  describe('SelectWidget', () => {
    it('should render a field that contains an enum of booleans', () => {
      const { node } = createFormComponent({
        schema: {
          enum: [true, false],
        },
      });

      expect(node.querySelectorAll('.field select')).toHaveLength(1);
    });

    it('should infer the value from an enum on change', () => {
      const onChange = jest.fn();
      const { node } = createFormComponent({
        schema: {
          enum: [true, false],
        },
        onChange,
      });

      expect(node.querySelectorAll('.field select')).toHaveLength(1);
      const $select = node.querySelector('.field select');
      expect($select.value).toBe('');

      Simulate.change($select, {
        target: { value: 'true' },
      });
      expect($select.value).toBe('true');
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: true,
        })
      );
    });

    it('should render a string field with a label', () => {
      const { node } = createFormComponent({
        schema: {
          enum: [true, false],
          title: 'foo',
        },
      });

      expect(node.querySelector('.field label')).toHaveTextContent('foo');
    });

    it('should assign a default value', () => {
      const { onChange } = createFormComponent({
        schema: {
          enum: [true, false],
          default: true,
        },
      });
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: true,
        })
      );
    });

    it('should handle a change event', () => {
      const { node, onChange } = createFormComponent({
        schema: {
          enum: [true, false],
        },
      });

      Simulate.change(node.querySelector('select'), {
        target: { value: 'false' },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: false,
        })
      );
    });

    it('should render the widget with the expected id', () => {
      const { node } = createFormComponent({
        schema: {
          enum: [true, false],
        },
      });

      expect(node.querySelector('select').id).toBe('root');
    });
  });
});
