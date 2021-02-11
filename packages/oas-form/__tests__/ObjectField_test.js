import React from 'react';
import { Simulate } from 'react-dom/test-utils';

import { createFormComponent, submitForm } from './test_utils';

describe('ObjectField', () => {
  describe('schema', () => {
    const schema = {
      type: 'object',
      title: 'my object',
      description: 'my description',
      required: ['foo'],
      default: {
        foo: 'hey',
        bar: true,
      },
      properties: {
        foo: {
          title: 'Foo',
          type: 'string',
        },
        bar: {
          type: 'boolean',
        },
      },
    };

    it('should render a fieldset', () => {
      const { node } = createFormComponent({ schema });

      const fieldset = node.querySelectorAll('fieldset');
      expect(fieldset).toHaveLength(1);
      expect(fieldset[0].id).toBe('root');
    });

    it('should render a fieldset legend', () => {
      const { node } = createFormComponent({ schema });

      const legend = node.querySelector('fieldset > legend');

      expect(legend).toHaveTextContent('my object');
      expect(legend.id).toBe('root__title');
    });

    it('should render a hidden object', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:widget': 'hidden',
        },
      });
      expect(node.querySelector('div.hidden > fieldset')).not.toBeNull();
    });

    it('should render a customized title', () => {
      const CustomTitleField = ({ title }) => <div id="custom">{title}</div>;

      const { node } = createFormComponent({
        schema,
        fields: {
          TitleField: CustomTitleField,
        },
      });
      expect(node.querySelector('fieldset > #custom')).toHaveTextContent('my object');
    });

    it('should render a customized description', () => {
      const CustomDescriptionField = ({ description }) => <div id="custom">{description}</div>;

      const { node } = createFormComponent({
        schema,
        fields: { DescriptionField: CustomDescriptionField },
      });
      expect(node.querySelector('fieldset > #custom')).toHaveTextContent('my description');
    });

    it('should render a default property label', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('.field-boolean label')).toHaveTextContent('bar');
    });

    it('should render a string property', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('.field input[type=text]')).toHaveLength(1);
    });

    it('should render a boolean property', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('.field input[type=checkbox]')).toHaveLength(1);
    });

    it('should handle a default object value', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('.field input[type=text]').value).toBe('hey');
      expect(node.querySelector('.field input[type=checkbox]')).toBeChecked();
    });

    it('should handle required values', () => {
      const { node } = createFormComponent({ schema });

      // Required field is <input type="text" required="">
      expect(node.querySelector('input[type=text]')).toBeRequired();
      expect(node.querySelector('.field-string label')).toHaveTextContent('Foo*');
    });

    it('should fill fields with form data', () => {
      const { node } = createFormComponent({
        schema,
        formData: {
          foo: 'hey',
          bar: true,
        },
      });

      expect(node.querySelector('.field input[type=text]').value).toBe('hey');
      expect(node.querySelector('.field input[type=checkbox]')).toBeChecked();
    });

    it('should handle object fields change events', () => {
      const { node, onChange } = createFormComponent({ schema });

      Simulate.change(node.querySelector('input[type=text]'), {
        target: { value: 'changed' },
      });

      expect(onChange).toHaveBeenLastCalledWith({
        formData: expect.objectContaining({ foo: 'changed' }),
      });
    });

    it('should handle object fields with blur events', () => {
      const onBlur = jest.fn();
      const { node } = createFormComponent({ schema, onBlur });

      const input = node.querySelector('input[type=text]');
      Simulate.blur(input, {
        target: { value: 'changed' },
      });

      expect(onBlur).toHaveBeenCalledWith(input.id, 'changed');
    });

    it('should handle object fields with focus events', () => {
      const onFocus = jest.fn();
      const { node } = createFormComponent({ schema, onFocus });

      const input = node.querySelector('input[type=text]');
      Simulate.focus(input, {
        target: { value: 'changed' },
      });

      expect(onFocus).toHaveBeenCalledWith(input.id, 'changed');
    });

    it('should render the widget with the expected id', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('input[type=text]').id).toBe('root_foo');
      expect(node.querySelector('input[type=checkbox]').id).toBe('root_bar');
    });
  });

  describe('fields ordering', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
        baz: { type: 'string' },
        qux: { type: 'string' },
      },
    };

    it('should use provided order', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', 'qux', 'bar', 'foo'],
        },
      });
      const labels = [].map.call(node.querySelectorAll('.field > label'), l => l.textContent);

      expect(labels).toStrictEqual(['baz', 'qux', 'bar', 'foo']);
    });

    it('should insert unordered properties at wildcard position', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', '*', 'foo'],
        },
      });
      const labels = [].map.call(node.querySelectorAll('.field > label'), l => l.textContent);

      expect(labels).toStrictEqual(['baz', 'bar', 'qux', 'foo']);
    });

    it('should use provided order also if order list contains extraneous properties', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', 'qux', 'bar', 'wut?', 'foo', 'huh?'],
        },
      });

      const labels = [].map.call(node.querySelectorAll('.field > label'), l => l.textContent);

      expect(labels).toStrictEqual(['baz', 'qux', 'bar', 'foo']);
    });

    it('should throw when order list misses an existing property', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', 'bar'],
        },
      });

      expect(node.querySelector('.config-error')).toHaveTextContent(/does not contain properties 'foo', 'qux'/);
    });

    it('should throw when more than one wildcard is present', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', '*', 'bar', '*'],
        },
      });

      expect(node.querySelector('.config-error')).toHaveTextContent(/contains more than one wildcard/);
    });

    it('should order referenced schema definitions', () => {
      const refSchema = {
        definitions: {
          testdef: { type: 'string' },
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' },
          bar: { $ref: '#/definitions/testdef' },
        },
      };

      const { node } = createFormComponent({
        schema: refSchema,
        uiSchema: {
          'ui:order': ['bar', 'foo'],
        },
      });
      const labels = [].map.call(node.querySelectorAll('.field > label'), l => l.textContent);

      expect(labels).toStrictEqual(['bar', 'foo']);
    });

    it('should order referenced object schema definition properties', () => {
      const refSchema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' },
            },
          },
        },
        type: 'object',
        properties: {
          root: { $ref: '#/definitions/testdef' },
        },
      };

      const { node } = createFormComponent({
        schema: refSchema,
        uiSchema: {
          root: {
            'ui:order': ['bar', 'foo'],
          },
        },
      });
      const labels = [].map.call(node.querySelectorAll('.field > label'), l => l.textContent);

      expect(labels).toStrictEqual(['bar', 'foo']);
    });

    it('should render the widget with the expected id', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          bar: { type: 'string' },
        },
      };

      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['bar', 'foo'],
        },
      });

      const ids = [].map.call(node.querySelectorAll('input[type=text]'), node => node.id);
      expect(ids).toStrictEqual(['root_bar', 'root_foo']);
    });
  });

  describe('Title', () => {
    const TitleField = props => <div id={`title-${props.title}`} />;

    const fields = { TitleField };

    it('should pass field name to TitleField if there is no title', () => {
      const schema = {
        type: 'object',
        properties: {
          object: {
            type: 'object',
            properties: {},
          },
        },
      };

      const { node } = createFormComponent({ schema, fields });
      expect(node.querySelector('#title-object')).not.toBeNull();
    });

    it('should pass schema title to TitleField', () => {
      const schema = {
        type: 'object',
        properties: {},
        title: 'test',
      };

      const { node } = createFormComponent({ schema, fields });
      expect(node.querySelector('#title-test')).not.toBeNull();
    });

    it('should pass empty schema title to TitleField', () => {
      const schema = {
        type: 'object',
        properties: {},
        title: '',
      };
      const { node } = createFormComponent({ schema, fields });
      expect(node.querySelector('#title-')).toBeNull();
    });
  });

  describe('additionalProperties', () => {
    const schema = {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    };

    it('should automatically add a property field if in formData', () => {
      const { node } = createFormComponent({
        schema,
        formData: { first: 1 },
      });

      expect(node.querySelectorAll('.field-string')).toHaveLength(1);
    });

    it('should apply uiSchema to additionalProperties', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          additionalProperties: {
            'ui:title': 'CustomName',
          },
        },
        formData: {
          property1: 'test',
        },
      });
      const labels = node.querySelectorAll('label.control-label');
      expect(labels[0]).toHaveTextContent('CustomName Key');
      expect(labels[1]).toHaveTextContent('CustomName');
    });

    it('should not throw validation errors if additionalProperties is undefined', () => {
      const undefinedAPSchema = {
        ...schema,
        properties: { second: { type: 'string' } },
      };
      delete undefinedAPSchema.additionalProperties;
      const { node, onSubmit, onError } = createFormComponent({
        schema: undefinedAPSchema,
        formData: { nonschema: 1 },
      });

      submitForm(node);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: { nonschema: 1 },
        }),
        expect.anything()
      );

      expect(onError).not.toHaveBeenCalled();
    });

    it('should throw a validation error if additionalProperties is false', () => {
      const { node, onSubmit, onError } = createFormComponent({
        schema: {
          ...schema,
          additionalProperties: false,
          properties: { second: { type: 'string' } },
        },
        formData: { nonschema: 1 },
      });
      submitForm(node);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onError).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          {
            message: 'is an invalid additional property',
            name: 'additionalProperties',
            params: { additionalProperty: 'nonschema' },
            property: "['nonschema']",
            schemaPath: '#/additionalProperties',
            stack: "['nonschema'] is an invalid additional property",
          },
        ])
      );
    });

    it('should still obey properties if additionalProperties is defined', () => {
      const { node } = createFormComponent({
        schema: {
          ...schema,
          properties: {
            definedProperty: {
              type: 'string',
            },
          },
        },
      });

      expect(node.querySelectorAll('.field-string')).toHaveLength(1);
    });

    it('should render a label for the additional property key', () => {
      const { node } = createFormComponent({
        schema,
        formData: { first: 1 },
      });

      expect(node.querySelector("[for='root_first-key']")).toHaveTextContent('first Key');
    });

    it('should render a label for the additional property key if additionalProperties is true', () => {
      const { node } = createFormComponent({
        schema: { ...schema, additionalProperties: true },
        formData: { first: 1 },
      });

      expect(node.querySelector("[for='root_first-key']")).toHaveTextContent('first Key');
    });

    it('should not render a label for the additional property key if additionalProperties is false', () => {
      const { node } = createFormComponent({
        schema: { ...schema, additionalProperties: false },
        formData: { first: 1 },
      });

      expect(node.querySelector("[for='root_first-key']")).toBeNull();
    });

    it('should render a text input for the additional property key', () => {
      const { node } = createFormComponent({
        schema,
        formData: { first: 1 },
      });

      expect(node.querySelector('#root_first-key').value).toBe('first');
    });

    it('should render a label for the additional property value', () => {
      const { node } = createFormComponent({
        schema,
        formData: { first: 1 },
      });

      expect(node.querySelector("[for='root_first']")).toHaveTextContent('first');
    });

    it('should render a text input for the additional property value', () => {
      const { node } = createFormComponent({
        schema,
        formData: { first: 1 },
      });

      expect(node.querySelector('#root_first').value).toBe('1');
    });

    it('should rename formData key if key input is renamed', () => {
      const { node, onChange } = createFormComponent({
        schema,
        formData: { first: 1 },
      });

      const textNode = node.querySelector('#root_first-key');
      Simulate.blur(textNode, {
        target: { value: 'newFirst' },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: { newFirst: 1, first: undefined },
        })
      );
    });

    it('should retain user-input data if key-value pair has a title present in the schema', () => {
      const { node, onChange } = createFormComponent({
        schema: {
          type: 'object',
          additionalProperties: {
            title: 'Custom title',
            type: 'string',
          },
        },
        formData: { 'Custom title': 1 },
      });

      const textNode = node.querySelector('#root_Custom\\ title-key');
      Simulate.blur(textNode, {
        target: { value: 'Renamed custom title' },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: { 'Renamed custom title': 1 },
        })
      );
    });

    it('should keep order of renamed key-value pairs while renaming key', () => {
      const { node, onChange } = createFormComponent({
        schema,
        formData: { first: 1, second: 2, third: 3 },
      });

      const textNode = node.querySelector('#root_second-key');
      Simulate.blur(textNode, {
        target: { value: 'newSecond' },
      });

      expect(onChange).toHaveBeenLastCalledWith({
        formData: { first: 1, newSecond: 2, third: 3 },
      });
    });

    it('should attach suffix to formData key if new key already exists when key input is renamed', () => {
      const formData = {
        first: 1,
        second: 2,
      };
      const { node, onChange } = createFormComponent({
        schema,
        formData,
      });

      const textNode = node.querySelector('#root_first-key');
      Simulate.blur(textNode, {
        target: { value: 'second' },
      });

      expect(onChange).toHaveBeenLastCalledWith({
        formData: { second: 2, 'second-1': 1 },
      });
    });

    it('should not attach suffix when input is only clicked', () => {
      const formData = {
        first: 1,
      };
      const { node, onChange } = createFormComponent({
        schema,
        formData,
      });

      const textNode = node.querySelector('#root_first-key');
      Simulate.blur(textNode);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should continue incrementing suffix to formData key until that key name is unique after a key input collision', () => {
      const formData = {
        first: 1,
        second: 2,
        'second-1': 2,
        'second-2': 2,
        'second-3': 2,
        'second-4': 2,
        'second-5': 2,
        'second-6': 2,
      };
      const { node, onChange } = createFormComponent({
        schema,
        formData,
      });

      const textNode = node.querySelector('#root_first-key');
      Simulate.blur(textNode, {
        target: { value: 'second' },
      });

      expect(onChange).toHaveBeenLastCalledWith({
        formData: {
          second: 2,
          'second-1': 2,
          'second-2': 2,
          'second-3': 2,
          'second-4': 2,
          'second-5': 2,
          'second-6': 2,
          'second-7': 1,
        },
      });
    });

    it('should have an expand button', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('.object-property-expand button')).not.toBeNull();
    });

    it('should not have an expand button if expandable is false', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: { 'ui:options': { expandable: false } },
      });

      expect(node.querySelector('.object-property-expand button')).toBeNull();
    });

    it('should add a new property when clicking the expand button', () => {
      const { node, onChange } = createFormComponent({ schema });

      Simulate.click(node.querySelector('.object-property-expand button'));

      expect(onChange).toHaveBeenCalledWith({
        formData: {
          newKey: 'New Value',
        },
      });
    });

    it("should add a new property with suffix when clicking the expand button and 'newKey' already exists", () => {
      const { node, onChange } = createFormComponent({
        schema,
        formData: { newKey: 1 },
      });

      Simulate.click(node.querySelector('.object-property-expand button'));
      expect(onChange).toHaveBeenCalledWith({
        formData: expect.objectContaining({
          'newKey-1': 'New Value',
        }),
      });
    });

    it('should not provide an expand button if length equals maxProperties', () => {
      const { node } = createFormComponent({
        schema: { maxProperties: 1, ...schema },
        formData: { first: 1 },
      });

      expect(node.querySelector('.object-property-expand button')).toBeNull();
    });

    it('should provide an expand button if length is less than maxProperties', () => {
      const { node } = createFormComponent({
        schema: { maxProperties: 2, ...schema },
        formData: { first: 1 },
      });

      expect(node.querySelector('.object-property-expand button')).not.toBeNull();
    });

    it('should not provide an expand button if expandable is expliclty false regardless of maxProperties value', () => {
      const { node } = createFormComponent({
        schema: { maxProperties: 2, ...schema },
        formData: { first: 1 },
        uiSchema: {
          'ui:options': {
            expandable: false,
          },
        },
      });

      expect(node.querySelector('.object-property-expand button')).toBeNull();
    });

    it('should ignore expandable value if maxProperties constraint is not satisfied', () => {
      const { node } = createFormComponent({
        schema: { maxProperties: 1, ...schema },
        formData: { first: 1 },
        uiSchema: {
          'ui:options': {
            expandable: true,
          },
        },
      });

      expect(node.querySelector('.object-property-expand button')).toBeNull();
    });

    it('should not have delete button if expand button has not been clicked', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('.form-group > .btn-danger')).toBeNull();
    });

    it('should have delete button if expand button has been clicked', () => {
      const { node } = createFormComponent({
        schema,
      });

      expect(
        node.querySelector('.form-group > .form-additional > .form-additional + .col-xs-2 .btn-danger')
      ).toBeNull();

      Simulate.click(node.querySelector('.object-property-expand button'));

      expect(node.querySelector('.form-group > .row > .form-additional + .col-xs-2 > .btn-danger')).not.toBeNull();
    });

    it('delete button should delete key-value pair', () => {
      const { node } = createFormComponent({
        schema,
        formData: { first: 1 },
      });
      expect(node.querySelector('#root_first-key').value).toBe('first');
      Simulate.click(node.querySelector('.form-group > .row > .form-additional + .col-xs-2 > .btn-danger'));
      expect(node.querySelector('#root_first-key')).toBeNull();
    });

    it('delete button should delete correct pair', () => {
      const { node } = createFormComponent({
        schema,
        formData: { first: 1, second: 2, third: 3 },
      });
      const selector = '.form-group > .row > .form-additional + .col-xs-2 > .btn-danger';
      expect(node.querySelectorAll(selector)).toHaveLength(3);
      Simulate.click(node.querySelectorAll(selector)[1]);
      expect(node.querySelector('#root_second-key')).toBeNull();
      expect(node.querySelectorAll(selector)).toHaveLength(2);
    });

    it('deleting content of value input should not delete pair', () => {
      const { node, onChange } = createFormComponent({
        schema,
        formData: { first: 1 },
      });

      Simulate.change(node.querySelector('#root_first'), {
        target: { value: '' },
      });

      expect(onChange).toHaveBeenLastCalledWith({
        formData: { first: '' },
      });
    });
  });
});
