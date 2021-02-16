import React from 'react';
import { Simulate } from 'react-dom/test-utils';

import { createFormComponent, setProps, submitForm } from './test_utils';

describe('NumberField', () => {
  describe('Number widget', () => {
    it('should use step to represent the multipleOf keyword', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'number',
          multipleOf: 5,
        },
      });

      expect(node.querySelector('input').step).toBe('5');
    });

    it('should use min to represent the minimum keyword', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'number',
          minimum: 0,
        },
      });

      expect(node.querySelector('input').min).toBe('0');
    });

    it('should use max to represent the maximum keyword', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'number',
          maximum: 100,
        },
      });

      expect(node.querySelector('input').max).toBe('100');
    });
  });

  describe('Number and text widget', () => {
    describe.each([[{}], [{ 'ui:options': { inputType: 'text' } }]])('with uiSchema: %s', (testCase, uiSchema) => {
      it('should render a string field with a label', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'number',
            title: 'foo',
          },
          uiSchema,
        });

        expect(node.querySelector('.field label')).toHaveTextContent('foo');
      });

      it('should render a string field with a description', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'number',
            description: 'bar',
          },
          uiSchema,
        });

        expect(node.querySelector('.field-description')).toHaveTextContent('bar');
      });

      it('formData should default to undefined', () => {
        const { node, onSubmit } = createFormComponent({
          schema: { type: 'number' },
          uiSchema,
          noValidate: true,
        });

        submitForm(node);
        expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ formData: undefined }), expect.anything());
      });

      it('should assign a default value', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'number',
            default: 2,
          },
          uiSchema,
        });

        expect(node.querySelector('.field input').value).toBe('2');
      });

      it('should handle a change event', () => {
        const { node, onChange } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
        });

        Simulate.change(node.querySelector('input'), {
          target: { value: '2' },
        });

        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ formData: 2 }));
      });

      it('should handle a blur event', () => {
        const onBlur = jest.fn();
        const { node } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
          onBlur,
        });

        const input = node.querySelector('input');
        Simulate.blur(input, {
          target: { value: '2' },
        });

        expect(onBlur).toHaveBeenCalledWith(input.id, '2');
      });

      it('should handle a focus event', () => {
        const onFocus = jest.fn();
        const { node } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
          onFocus,
        });

        const input = node.querySelector('input');
        Simulate.focus(input, {
          target: { value: '2' },
        });

        expect(onFocus).toHaveBeenCalledWith(input.id, '2');
      });

      it('should fill field with data', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
          formData: 2,
        });

        expect(node.querySelector('.field input').value).toBe('2');
      });

      describe('when inputting a number that ends with a dot and/or zero it should normalize it, without changing the input value', () => {
        const { node, onChange } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
        });

        const $input = node.querySelector('input');

        it.each([
          // ['2.', 2],
          ['2.0', 2],
          ['2.3', 2.3],
          ['2.30', 2.3],
          ['2.300', 2.3],
          ['2.3001', 2.3001],
          ['2.03', 2.03],
          ['2.003', 2.003],
          ['2.00300', 2.003],
          ['200300', 200300],
        ])('should work with an input value of: %s', (input, output) => {
          Simulate.change($input, {
            target: { value: input },
          });

          expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ formData: output }));
          expect($input.value).toBe(input);
        });
      });

      it('should normalize values beginning with a decimal point', () => {
        const { node, onChange } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
        });

        const $input = node.querySelector('input');

        Simulate.change($input, {
          target: { value: '.00' },
        });

        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ formData: 0 }));
        expect($input.value).toBe('.00');
      });

      it('should update input values correctly when formData prop changes', () => {
        const schema = {
          type: 'number',
        };

        const { comp, node } = createFormComponent({
          schema,
          uiSchema,
          formData: 2.03,
        });

        const $input = node.querySelector('input');

        expect($input.value).toBe('2.03');

        setProps(comp, {
          schema,
          formData: 203,
        });

        expect($input.value).toBe('203');
      });

      it('should render the widget with the expected id', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
        });

        expect(node.querySelector('input').id).toBe('root');
      });

      it('should render with trailing zeroes', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
        });

        /* Simulate.change(node.querySelector('input'), {
          target: { value: '2.' },
        });
        expect(node.querySelector('.field input').value).toStrictEqual('2.'); */

        Simulate.change(node.querySelector('input'), {
          target: { value: '2.0' },
        });
        expect(node.querySelector('.field input').value).toBe('2.0');

        Simulate.change(node.querySelector('input'), {
          target: { value: '2.00' },
        });
        expect(node.querySelector('.field input').value).toBe('2.00');

        Simulate.change(node.querySelector('input'), {
          target: { value: '2.000' },
        });
        expect(node.querySelector('.field input').value).toBe('2.000');
      });

      it('should allow a zero to be input', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
        });

        Simulate.change(node.querySelector('input'), {
          target: { value: '0' },
        });
        expect(node.querySelector('.field input').value).toBe('0');
      });

      it('should render customized StringField', () => {
        const CustomStringField = () => <div id="custom" />;

        const { node } = createFormComponent({
          schema: {
            type: 'number',
          },
          uiSchema,
          fields: {
            StringField: CustomStringField,
          },
        });

        expect(node.querySelector('#custom')).not.toBeNull();
      });
    });
  });

  describe('SelectWidget', () => {
    it('should render a number field', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2],
        },
      });

      expect(node.querySelectorAll('.field select')).toHaveLength(1);
    });

    it('should infer the value from an enum on change', () => {
      const onChange = jest.fn();
      const { node } = createFormComponent({
        schema: {
          enum: [1, 2],
        },
        onChange,
      });

      expect(node.querySelectorAll('.field select')).toHaveLength(1);
      const $select = node.querySelector('.field select');
      expect($select.value).toBe('');

      Simulate.change(node.querySelector('.field select'), {
        target: { value: '1' },
      });
      expect($select.value).toBe('1');
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ formData: 1 }));
    });

    it('should render a string field with a label', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2],
          title: 'foo',
        },
      });

      expect(node.querySelector('.field label')).toHaveTextContent('foo');
    });

    it('should assign a default value', () => {
      const { onChange } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2],
          default: 1,
        },
        noValidate: true,
      });

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ formData: 1 }));
    });

    it('should handle a change event', () => {
      const { node, onChange } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2],
        },
      });

      Simulate.change(node.querySelector('select'), {
        target: { value: '2' },
      });

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ formData: 2 }));
    });

    it('should fill field with data', () => {
      const { node, onSubmit } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2],
        },
        formData: 2,
      });
      submitForm(node);
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ formData: 2 }), expect.anything());
    });

    it('should render the widget with the expected id', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2],
        },
      });

      expect(node.querySelector('select').id).toBe('root');
    });

    it('should render a select element with a blank option, when default value is not set.', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'number',
            enum: [0],
          },
        },
      };

      const { node } = createFormComponent({
        schema,
      });

      const selects = node.querySelectorAll('select');
      expect(selects[0].value).toBe('');

      const options = node.querySelectorAll('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toBeEmptyDOMElement('');
    });

    it('should render a select element without a blank option, if a default value is set.', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'number',
            enum: [2],
            default: 2,
          },
        },
      };

      const { node } = createFormComponent({
        schema,
      });

      const selects = node.querySelectorAll('select');
      expect(selects[0].value).toBe('2');

      const options = node.querySelectorAll('option');
      expect(options).toHaveLength(1);
      expect(options[0].innerHTML).toBe('2');
    });

    it('should render a select element without a blank option, if the default value is 0.', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'number',
            enum: [0],
            default: 0,
          },
        },
      };

      const { node } = createFormComponent({
        schema,
      });

      const selects = node.querySelectorAll('select');
      expect(selects[0].value).toBe('0');

      const options = node.querySelectorAll('option');
      expect(options).toHaveLength(1);
      expect(options[0].innerHTML).toBe('0');
    });
  });
});
