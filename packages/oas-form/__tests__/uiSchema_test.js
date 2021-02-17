/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "shouldBeDisabled", "shouldBeReadonly", "shouldFocus"] }] */
import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import SelectWidget from '../src/components/widgets/SelectWidget';
import RadioWidget from '../src/components/widgets/RadioWidget';
import { createFormComponent, submitForm } from './test_utils';

describe('uiSchema', () => {
  describe('custom classNames', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
        },
        bar: {
          type: 'string',
        },
      },
    };

    const uiSchema = {
      foo: {
        classNames: 'class-for-foo',
      },
      bar: {
        classNames: 'class-for-bar another-for-bar',
      },
    };

    it('should apply custom class names to target widgets', () => {
      const { node } = createFormComponent({ schema, uiSchema });
      const [foo, bar] = node.querySelectorAll('.field-string');

      expect(foo).toHaveClass('class-for-foo');
      expect(bar).toHaveClass('class-for-bar');
      expect(bar).toHaveClass('another-for-bar');
    });
  });

  describe('custom widget', () => {
    describe('root widget', () => {
      const schema = {
        type: 'string',
      };

      const uiSchema = {
        'ui:widget': props => {
          return (
            <input
              className="custom"
              defaultValue={props.defaultValue}
              onChange={event => props.onChange(event.target.value)}
              required={props.required}
              type="text"
              value={props.value}
            />
          );
        },
      };

      it('should render a root custom widget', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('.custom')).toHaveLength(1);
      });
    });

    describe('custom options', () => {
      let widget;
      let widgets;
      let schema;
      let uiSchema;

      beforeEach(() => {
        jest.spyOn(console, 'warn');

        widget = ({ label, options }) => <div id={label} style={options} />;
        widget.defaultProps = {
          options: {
            background: 'yellow',
            color: 'green',
          },
        };

        widgets = {
          widget,
        };

        // all fields in one schema to catch errors where options passed to one instance
        // of a widget are persistent across all instances
        schema = {
          type: 'object',
          properties: {
            funcAll: {
              type: 'string',
            },
            funcNone: {
              type: 'string',
            },
            stringAll: {
              type: 'string',
            },
            stringNone: {
              type: 'string',
            },
            stringTel: {
              type: 'string',
            },
          },
        };

        uiSchema = {
          // pass widget as function
          funcAll: {
            'ui:widget': {
              component: widget,
              options: {
                background: 'purple',
              },
            },
            'ui:options': {
              margin: '7px',
            },
            'ui:padding': '42px',
          },
          funcNone: {
            'ui:widget': widget,
          },

          // pass widget as string
          stringAll: {
            'ui:widget': {
              component: 'widget',
              options: {
                background: 'blue',
              },
            },
            'ui:options': {
              margin: '19px',
            },
            'ui:padding': '41px',
          },
          stringNone: {
            'ui:widget': 'widget',
          },
          stringTel: {
            'ui:options': {
              inputType: 'tel',
            },
          },
        };
      });

      it('should log warning when deprecated ui:widget: {component, options} api is used', () => {
        createFormComponent({
          schema: {
            type: 'string',
          },
          uiSchema: {
            'ui:widget': {
              component: 'widget',
            },
          },
          widgets,
        });
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('ui:widget object is deprecated'));
      });

      it('should cache MergedWidget instance', () => {
        expect(widget.MergedWidget).toBeUndefined();
        createFormComponent({
          schema: {
            type: 'string',
          },
          uiSchema: {
            'ui:widget': 'widget',
          },
          widgets,
        });
        const cached = widget.MergedWidget;
        expect(typeof cached).toBe('function');
        createFormComponent({
          schema: {
            type: 'string',
          },
          uiSchema: {
            'ui:widget': 'widget',
          },
          widgets,
        });
        expect(widget.MergedWidget).toStrictEqual(cached);
      });

      it('should render merged ui:widget options for widget referenced as function', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          widgets,
        });
        const widget = node.querySelector('#funcAll');

        expect(widget).toHaveStyle({ background: 'purple' });
        expect(widget).toHaveStyle({ color: 'green' });
        expect(widget).toHaveStyle({ margin: '7px' });
        expect(widget).toHaveStyle({ padding: '42px' });
      });

      it('should render ui:widget default options for widget referenced as function', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          widgets,
        });
        const widget = node.querySelector('#funcNone');

        expect(widget).toHaveStyle({ background: 'yellow' });
        expect(widget).toHaveStyle({ color: 'green' });
        expect(widget).toHaveStyle({ margin: '' });
        expect(widget).toHaveStyle({ padding: '' });
      });

      it('should render merged ui:widget options for widget referenced as string', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          widgets,
        });
        const widget = node.querySelector('#stringAll');

        expect(widget).toHaveStyle({ background: 'blue' });
        expect(widget).toHaveStyle({ color: 'green' });
        expect(widget).toHaveStyle({ margin: '19px' });
        expect(widget).toHaveStyle({ padding: '41px' });
      });

      it('should render ui:widget default options for widget referenced as string', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          widgets,
        });
        const widget = node.querySelector('#stringNone');

        expect(widget).toHaveStyle({ background: 'yellow' });
        expect(widget).toHaveStyle({ color: 'green' });
        expect(widget).toHaveStyle({ margin: '' });
        expect(widget).toHaveStyle({ padding: '' });
      });

      it('should ui:option inputType for html5 input types', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          widgets,
        });
        expect(node.querySelector("input[type='tel']")).not.toBeNull();
      });
    });

    describe('nested widget', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string',
          },
        },
      };

      const uiSchema = {
        field: {
          'ui:widget': 'custom',
        },
      };

      const CustomWidget = props => {
        return (
          <input
            className="custom"
            defaultValue={props.defaultValue}
            onChange={event => props.onChange(event.target.value)}
            required={props.required}
            type="text"
            value={props.value}
          />
        );
      };

      const widgets = {
        custom: CustomWidget,
      };

      it('should render a nested custom widget', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          widgets,
        });

        expect(node.querySelectorAll('.custom')).toHaveLength(1);
      });
    });

    describe('options', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string',
          },
        },
      };

      const CustomWidget = props => {
        const { value, options } = props;
        return <input className={options.className} type="text" value={value} />;
      };

      describe('direct reference', () => {
        const uiSchema = {
          field: {
            'ui:widget': CustomWidget,
            'ui:options': {
              className: 'custom',
            },
          },
        };

        it('should render a custom widget with options', () => {
          const { node } = createFormComponent({ schema, uiSchema });

          expect(node.querySelectorAll('.custom')).toHaveLength(1);
        });
      });

      describe('string reference', () => {
        const uiSchema = {
          field: {
            'ui:widget': 'custom',
            'ui:options': {
              className: 'custom',
            },
          },
        };

        const widgets = {
          custom: CustomWidget,
        };

        it('should render a custom widget with options', () => {
          const { node } = createFormComponent({
            schema,
            uiSchema,
            widgets,
          });

          expect(node.querySelectorAll('.custom')).toHaveLength(1);
        });
      });
    });

    describe('enum fields native options', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            enum: ['foo', 'bar'],
          },
        },
      };

      const CustomWidget = props => {
        const { options } = props;
        const { enumOptions, className } = options;
        return (
          <select className={className}>
            {enumOptions.map(({ value }, i) => (
              <option key={i}>{value}</option>
            ))}
          </select>
        );
      };

      const uiSchema = {
        field: {
          'ui:widget': CustomWidget,
          'ui:options': {
            className: 'custom',
          },
        },
      };

      it('should merge enumOptions with custom options', () => {
        const { node } = createFormComponent({ schema, uiSchema });
        expect(node.querySelectorAll('.custom option')).toHaveLength(2);
      });
    });

    describe('enum fields disabled options', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            enum: ['foo', 'bar'],
          },
        },
      };
      const uiSchema = {
        field: {
          'ui:widget': SelectWidget,
          'ui:options': {
            className: 'custom',
          },
          'ui:enumDisabled': ['foo'],
        },
      };

      it('should have atleast one option disabled', () => {
        const { node } = createFormComponent({ schema, uiSchema });
        const disabledOptionsLen = uiSchema.field['ui:enumDisabled'].length;
        expect(node.querySelectorAll('option:disabled')).toHaveLength(disabledOptionsLen);
        expect(node.querySelectorAll('option:enabled')).toHaveLength(
          // Two options, one disabled, plus the placeholder
          2 - disabledOptionsLen + 1
        );
      });
    });

    describe('enum fields disabled radio options', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            enum: ['foo', 'bar'],
          },
        },
      };
      const uiSchema = {
        field: {
          'ui:widget': RadioWidget,
          'ui:options': {
            className: 'custom',
          },
          'ui:enumDisabled': ['foo'],
        },
      };

      it('should have atleast one radio option disabled', () => {
        const { node } = createFormComponent({ schema, uiSchema });
        const disabledOptionsLen = uiSchema.field['ui:enumDisabled'].length;
        expect(node.querySelectorAll('input:disabled')).toHaveLength(disabledOptionsLen);
        expect(node.querySelectorAll('input:enabled')).toHaveLength(
          // Two options, one disabled, plus the placeholder
          2 - disabledOptionsLen
        );
      });
    });
  });

  describe('ui:help', () => {
    it('should render the provided help text', () => {
      const schema = {
        type: 'string',
      };
      const uiSchema = {
        'ui:help': 'plop',
      };

      const { node } = createFormComponent({ schema, uiSchema });

      expect(node.querySelector('p.help-block')).toHaveTextContent('plop');
    });
  });

  describe('ui:title', () => {
    it('should render the provided title text', () => {
      const schema = {
        type: 'string',
      };
      const uiSchema = {
        'ui:title': 'plop',
      };

      const { node } = createFormComponent({ schema, uiSchema });

      expect(node.querySelector('label.control-label')).toHaveTextContent('plop');
    });
  });

  describe('ui:description', () => {
    it('should render the provided description text', () => {
      const schema = {
        type: 'string',
      };
      const uiSchema = {
        'ui:description': 'plop',
      };

      const { node } = createFormComponent({ schema, uiSchema });

      expect(node.querySelector('p.field-description')).toHaveTextContent('plop');
    });
  });

  it('should accept a react element as help', () => {
    const schema = {
      type: 'string',
    };
    const uiSchema = {
      'ui:help': <b>plop</b>,
    };

    const { node } = createFormComponent({ schema, uiSchema });

    expect(node.querySelector('div.help-block')).toHaveTextContent('plop');
  });

  // These tests don't work under Jest and Jest-DOM so skipping them. Do we really need `ui:focus`?
  describe.skip('ui:focus', () => {
    const shouldFocus = (schema, uiSchema, selector = 'input', formData) => {
      const props = {
        schema,
        uiSchema,
      };
      if (typeof formData !== 'undefined') {
        props.formData = formData;
      }

      const { node } = createFormComponent(props);
      expect(node.querySelector(selector)).toHaveFocus();
    };

    describe('number', () => {
      it('should focus on integer input', () => {
        shouldFocus(
          {
            type: 'integer',
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on integer input, updown widget', () => {
        shouldFocus(
          {
            type: 'integer',
          },
          {
            'ui:widget': 'updown',
            'ui:autofocus': true,
          }
        );
      });

      it('should focus on integer input, range widget', () => {
        shouldFocus(
          {
            type: 'integer',
          },
          {
            'ui:widget': 'range',
            'ui:autofocus': true,
          }
        );
      });

      it('should focus on integer enum input', () => {
        shouldFocus(
          {
            type: 'integer',
            enum: [1, 2, 3],
          },
          {
            'ui:autofocus': true,
          },
          'select'
        );
      });
    });

    describe('string', () => {
      it('should focus on text input', () => {
        shouldFocus(
          {
            type: 'string',
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on textarea', () => {
        shouldFocus(
          {
            type: 'string',
          },
          {
            'ui:widget': 'textarea',
            'ui:autofocus': true,
          },
          'textarea'
        );
      });

      it('should focus on password input', () => {
        shouldFocus(
          {
            type: 'string',
          },
          {
            'ui:widget': 'password',
            'ui:autofocus': true,
          }
        );
      });

      it('should focus on color input', () => {
        shouldFocus(
          {
            type: 'string',
          },
          {
            'ui:widget': 'color',
            'ui:autofocus': true,
          }
        );
      });

      it('should focus on email input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'email',
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on uri input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'uri',
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on data-url input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'data-url',
          },
          { 'ui:autofocus': true }
        );
      });
    });

    describe('object', () => {
      it('should focus on date input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'date',
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on date-time input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'date-time',
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on alt-date input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'date',
          },
          {
            'ui:widget': 'alt-date',
            'ui:autofocus': true,
          },
          'select'
        );
      });

      it('should focus on alt-date-time input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'date-time',
          },
          {
            'ui:widget': 'alt-datetime',
            'ui:autofocus': true,
          },
          'select'
        );
      });
    });

    describe('array', () => {
      it('should focus on multiple files input', () => {
        shouldFocus(
          {
            type: 'array',
            items: {
              type: 'string',
              format: 'data-url',
            },
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on first item of a list of strings', () => {
        shouldFocus(
          {
            type: 'array',
            items: {
              type: 'string',
              default: 'foo',
            },
          },
          {
            'ui:autofocus': true,
          },
          'input',
          ['foo', 'bar']
        );
      });

      it('should focus on first item of a multiple choices list', () => {
        shouldFocus(
          {
            type: 'array',
            items: {
              type: 'string',
              enum: ['foo', 'bar'],
            },
            uniqueItems: true,
          },
          {
            'ui:widget': 'checkboxes',
            'ui:autofocus': true,
          },
          'input',
          ['bar']
        );
      });
    });

    describe('boolean', () => {
      it('should focus on checkbox input', () => {
        shouldFocus(
          {
            type: 'boolean',
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on radio input', () => {
        shouldFocus(
          {
            type: 'boolean',
          },
          {
            'ui:widget': 'radio',
            'ui:autofocus': true,
          }
        );
      });

      it('should focus on select input', () => {
        shouldFocus(
          {
            type: 'boolean',
          },
          {
            'ui:widget': 'select',
            'ui:autofocus': true,
          },
          'select'
        );
      });
    });
  });

  describe('string', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
        },
      },
    };

    describe('file', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'file',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('input[type=file]')).toHaveLength(1);
      });
    });

    describe('textarea', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'textarea',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('textarea')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a',
          },
        });

        expect(node.querySelector('textarea').value).toBe('a');
      });

      it('should call onChange handler when text is updated', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a',
          },
        });

        Simulate.change(node.querySelector('textarea'), {
          target: {
            value: 'b',
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: 'b' },
        });
      });
    });

    describe('password', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'password',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=password]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a',
          },
        });

        expect(node.querySelector('[type=password]').value).toBe('a');
      });

      it('should call onChange handler when text is updated is checked', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a',
          },
        });

        Simulate.change(node.querySelector('[type=password]'), {
          target: {
            value: 'b',
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: 'b' },
        });
      });
    });

    describe('color', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'color',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=color]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: '#151ce6',
          },
        });

        expect(node.querySelector('[type=color]').value).toBe('#151ce6');
      });

      it('should call onChange handler when text is updated', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: '#151ce6',
          },
        });

        Simulate.change(node.querySelector('[type=color]'), {
          target: {
            value: '#001122',
          },
        });
        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: '#001122' },
        });
      });
    });

    describe('hidden', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'hidden',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=hidden]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a',
          },
        });

        expect(node.querySelector('[type=hidden]').value).toBe('a');
      });

      it('should map widget value to a typed event property', () => {
        const { node, onSubmit } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a',
          },
        });

        submitForm(node);

        expect(onSubmit).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: { foo: 'a' },
          }),
          expect.anything()
        );
      });
    });
  });

  describe('string (enum)', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          enum: ['a', 'b'],
        },
      },
    };

    describe('radio', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'radio',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=radio]')).toHaveLength(2);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'b',
          },
        });

        expect(node.querySelectorAll('[type=radio]')[1]).toBeChecked();
      });

      it('should call onChange handler when value is updated', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a',
          },
        });

        Simulate.change(node.querySelectorAll('[type=radio]')[1], {
          target: {
            checked: true,
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: 'b' },
        });
      });
    });
  });

  describe('number', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'number',
          multipleOf: 1,
          minimum: 10,
          maximum: 100,
        },
      },
    };

    describe('updown', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'updown',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=number]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3.14,
          },
        });

        expect(node.querySelector('[type=number]').value).toBe('3.14');
      });

      it('should call onChange handler when value is updated', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3.14,
          },
        });

        Simulate.change(node.querySelector('[type=number]'), {
          target: {
            value: '6.28',
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: 6.28 },
        });
      });

      describe('Constraint attributes', () => {
        let input;

        beforeEach(() => {
          const { node } = createFormComponent({ schema, uiSchema });
          input = node.querySelector('[type=number]');
        });

        it('should support the minimum constraint', () => {
          expect(input).toHaveAttribute('min', '10');
        });

        it('should support maximum constraint', () => {
          expect(input).toHaveAttribute('max', '100');
        });

        it("should support '0' as minimum and maximum constraints", () => {
          const schema = {
            type: 'number',
            minimum: 0,
            maximum: 0,
          };
          const uiSchema = {
            'ui:widget': 'updown',
          };
          const { node } = createFormComponent({ schema, uiSchema });
          input = node.querySelector('[type=number]');

          expect(input).toHaveAttribute('min', '0');
          expect(input).toHaveAttribute('max', '0');
        });

        it('should support the multipleOf constraint', () => {
          expect(input).toHaveAttribute('step', '1');
        });
      });
    });

    describe('range', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'range',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=range]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 10.14,
          },
        });

        expect(node.querySelector('[type=range]').value).toBe('10.14');
      });

      it('should call onChange handler when value is updated', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3.14,
          },
        });

        Simulate.change(node.querySelector('[type=range]'), {
          target: {
            value: '6.28',
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: 6.28 },
        });
      });

      describe('Constraint attributes', () => {
        let input;

        beforeEach(() => {
          const { node } = createFormComponent({ schema, uiSchema });
          input = node.querySelector('[type=range]');
        });

        it('should support the minimum constraint', () => {
          expect(input).toHaveAttribute('min', '10');
        });

        it('should support maximum constraint', () => {
          expect(input).toHaveAttribute('max', '100');
        });

        it("should support '0' as minimum and maximum constraints", () => {
          const schema = {
            type: 'number',
            minimum: 0,
            maximum: 0,
          };
          const uiSchema = {
            'ui:widget': 'range',
          };
          const { node } = createFormComponent({ schema, uiSchema });
          input = node.querySelector('[type=range]');

          expect(input).toHaveAttribute('min', '0');
          expect(input).toHaveAttribute('max', '0');
        });

        it('should support the multipleOf constraint', () => {
          expect(input).toHaveAttribute('step', '1');
        });
      });
    });

    describe('radio', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'number',
            enum: [3.14159, 2.718, 1.4142],
          },
        },
      };

      const uiSchema = {
        foo: {
          'ui:widget': 'radio',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=radio]')).toHaveLength(3);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 2.718,
          },
        });

        expect(node.querySelectorAll('[type=radio]')[1]).toBeChecked();
      });

      it('should call onChange handler when value is updated', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 1.4142,
          },
        });

        Simulate.change(node.querySelectorAll('[type=radio]')[2], {
          target: {
            checked: true,
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: 1.4142 },
        });
      });
    });

    describe('hidden', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'hidden',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=hidden]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 42,
          },
        });

        expect(node.querySelector('[type=hidden]').value).toBe('42');
      });

      it('should map widget value to a typed event property', () => {
        const { node, onSubmit } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 42,
          },
        });

        submitForm(node);

        expect(onSubmit).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: { foo: 42 },
          }),
          expect.anything()
        );
      });
    });
  });

  describe('integer', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'integer',
        },
      },
    };

    describe('updown', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'updown',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=number]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3,
          },
        });

        expect(node.querySelector('[type=number]').value).toBe('3');
      });

      it('should call onChange handler when value is updated', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3,
          },
        });

        Simulate.change(node.querySelector('[type=number]'), {
          target: {
            value: '6',
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: 6 },
        });
      });
    });

    describe('range', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'range',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=range]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3,
          },
        });

        expect(node.querySelector('[type=range]').value).toBe('3');
      });

      it('should call onChange handler when value is updated', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3,
          },
        });

        Simulate.change(node.querySelector('[type=range]'), {
          target: {
            value: '6',
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: 6 },
        });
      });
    });

    describe('radio', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'integer',
            enum: [1, 2],
          },
        },
      };

      const uiSchema = {
        foo: {
          'ui:widget': 'radio',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=radio]')).toHaveLength(2);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 2,
          },
        });

        expect(node.querySelectorAll('[type=radio]')[1]).toBeChecked(true);
      });

      it('should call onChange handler when value is updated', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 1,
          },
        });

        Simulate.change(node.querySelectorAll('[type=radio]')[1], {
          target: {
            checked: true,
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: 2 },
        });
      });
    });

    describe('hidden', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'hidden',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=hidden]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 42,
          },
        });

        expect(node.querySelector('[type=hidden]').value).toBe('42');
      });

      it('should map widget value to a typed event property', () => {
        const { node, onSubmit } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 42,
          },
        });

        submitForm(node);

        expect(onSubmit).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: { foo: 42 },
          }),
          expect.anything()
        );
      });
    });
  });

  describe('boolean', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'boolean',
        },
      },
    };

    describe('radio', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'radio',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=radio]')).toHaveLength(2);
        expect(node.querySelectorAll('[type=radio]')[0]).not.toBeNull();
        expect(node.querySelectorAll('[type=radio]')[1]).not.toBeNull();
      });

      it('should render boolean option labels', () => {
        const { node } = createFormComponent({ schema, uiSchema });
        const labels = [].map.call(node.querySelectorAll('.field-radio-group label'), node => node.textContent);

        expect(labels).toStrictEqual(['Yes', 'No']);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: false,
          },
        });

        expect(node.querySelectorAll('[type=radio]')[1]).toBeChecked();
      });

      it('should call onChange handler when false is checked', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: true,
          },
        });

        Simulate.change(node.querySelectorAll('[type=radio]')[1], {
          target: {
            checked: true,
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: false },
        });
      });

      it('should call onChange handler when true is checked', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: false,
          },
        });

        Simulate.change(node.querySelectorAll('[type=radio]')[0], {
          target: {
            checked: true,
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: true },
        });
      });
    });

    describe('select', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'select',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('select option')).toHaveLength(3);
      });

      it('should render boolean option labels', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('option')[1]).toHaveTextContent('Yes');
        expect(node.querySelectorAll('option')[2]).toHaveTextContent('No');
      });

      it('should call onChange handler when true is selected', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: false,
          },
        });

        Simulate.change(node.querySelector('select'), {
          // DOM option change events always return strings
          target: {
            value: 'true',
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: true },
        });
      });

      it('should call onChange handler when false is selected', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: false,
          },
        });

        Simulate.change(node.querySelector('select'), {
          // DOM option change events always return strings
          target: {
            value: 'false',
          },
        });

        expect(onChange).toHaveBeenLastCalledWith({
          formData: { foo: false },
        });
      });
    });

    describe('hidden', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'hidden',
        },
      };

      it('should accept a uiSchema object', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=hidden]')).toHaveLength(1);
      });

      it('should support formData', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: true,
          },
        });

        expect(node.querySelector('[type=hidden]').value).toBe('true');
      });

      it('should map widget value to a typed event property', () => {
        const { node, onSubmit } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: true,
          },
        });

        submitForm(node);

        expect(onSubmit).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: { foo: true },
          }),
          expect.anything()
        );
      });
    });
  });

  describe('custom root field id', () => {
    it('should use a custom root field id for objects', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
          bar: {
            type: 'string',
          },
        },
      };
      const uiSchema = {
        'ui:rootFieldId': 'myform',
      };
      const { node } = createFormComponent({ schema, uiSchema });

      const ids = [].map.call(node.querySelectorAll('input[type=text]'), node => node.id);
      expect(ids).toStrictEqual(['myform_foo', 'myform_bar']);
    });

    it('should use a custom root field id for arrays', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string',
        },
      };
      const uiSchema = {
        'ui:rootFieldId': 'myform',
      };
      const { node } = createFormComponent({
        schema,
        uiSchema,
        formData: ['foo', 'bar'],
      });

      const ids = [].map.call(node.querySelectorAll('input[type=text]'), node => node.id);
      expect(ids).toStrictEqual(['myform_0', 'myform_1']);
    });

    it('should use a custom root field id for array of objects', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
            },
            bar: {
              type: 'string',
            },
          },
        },
      };
      const uiSchema = {
        'ui:rootFieldId': 'myform',
      };
      const { node } = createFormComponent({
        schema,
        uiSchema,
        formData: [
          {
            foo: 'foo1',
            bar: 'bar1',
          },
          {
            foo: 'foo2',
            bar: 'bar2',
          },
        ],
      });

      const ids = [].map.call(node.querySelectorAll('input[type=text]'), node => node.id);
      expect(ids).toStrictEqual(['myform_0_foo', 'myform_0_bar', 'myform_1_foo', 'myform_1_bar']);
    });
  });

  describe('Disabled', () => {
    describe('Fields', () => {
      describe('ArrayField', () => {
        let node;

        beforeEach(() => {
          const schema = {
            type: 'array',
            items: {
              type: 'string',
            },
          };
          const uiSchema = {
            'ui:disabled': true,
          };
          const formData = ['a', 'b'];

          const rendered = createFormComponent({
            schema,
            uiSchema,
            formData,
          });
          node = rendered.node;
        });

        it('should disable an ArrayField', () => {
          const disabled = [].map.call(node.querySelectorAll('[type=text]'), node => node.disabled);
          expect(disabled).toStrictEqual([true, true]);
        });

        it('should disable the Add button', () => {
          expect(node.querySelector('.array-item-add button')).toBeDisabled();
        });

        it('should disable the Delete button', () => {
          expect(node.querySelector('.array-item-remove')).toBeDisabled();
        });
      });

      describe('ObjectField', () => {
        let node;

        beforeEach(() => {
          const schema = {
            type: 'object',
            properties: {
              foo: {
                type: 'string',
              },
              bar: {
                type: 'string',
              },
            },
          };
          const uiSchema = {
            'ui:disabled': true,
          };

          const rendered = createFormComponent({ schema, uiSchema });
          node = rendered.node;
        });

        it('should disable an ObjectField', () => {
          const disabled = [].map.call(node.querySelectorAll('[type=text]'), node => node.disabled);
          expect(disabled).toStrictEqual([true, true]);
        });
      });
    });

    describe('Widgets', () => {
      function shouldBeDisabled(selector, schema, uiSchema) {
        const { node } = createFormComponent({ schema, uiSchema });
        expect(node.querySelector(selector)).toBeDisabled();
      }

      it('should disable a text widget', () => {
        shouldBeDisabled(
          'input[type=text]',
          {
            type: 'string',
          },
          { 'ui:disabled': true }
        );
      });

      it('should disabled a file widget', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'string',
            format: 'data-url',
          },
          uiSchema: {
            'ui:disabled': true,
          },
        });
        expect(node.querySelector('input[type=file]')).toHaveAttribute('disabled');
      });

      it('should disable a textarea widget', () => {
        shouldBeDisabled(
          'textarea',
          {
            type: 'string',
          },
          {
            'ui:disabled': true,
            'ui:widget': 'textarea',
          }
        );
      });

      it('should disable a number text widget', () => {
        shouldBeDisabled(
          'input[type=number]',
          {
            type: 'number',
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a number widget', () => {
        shouldBeDisabled(
          'input[type=number]',
          {
            type: 'number',
          },
          {
            'ui:disabled': true,
            'ui:widget': 'updown',
          }
        );
      });

      it('should disable a range widget', () => {
        shouldBeDisabled(
          'input[type=range]',
          {
            type: 'number',
          },
          {
            'ui:disabled': true,
            'ui:widget': 'range',
          }
        );
      });

      it('should disable a select widget', () => {
        shouldBeDisabled(
          'select',
          {
            type: 'string',
            enum: ['a', 'b'],
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a checkbox widget', () => {
        shouldBeDisabled(
          'input[type=checkbox]',
          {
            type: 'boolean',
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a radio widget', () => {
        shouldBeDisabled(
          'input[type=radio]',
          {
            type: 'boolean',
          },
          {
            'ui:disabled': true,
            'ui:widget': 'radio',
          }
        );
      });

      it('should disable a color widget', () => {
        shouldBeDisabled(
          'input[type=color]',
          {
            type: 'string',
            format: 'color',
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a password widget', () => {
        shouldBeDisabled(
          'input[type=password]',
          {
            type: 'string',
          },
          {
            'ui:disabled': true,
            'ui:widget': 'password',
          }
        );
      });

      it('should disable an email widget', () => {
        shouldBeDisabled(
          'input[type=email]',
          {
            type: 'string',
            format: 'email',
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a date widget', () => {
        shouldBeDisabled(
          'input[type=date]',
          {
            type: 'string',
            format: 'date',
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a datetime widget', () => {
        shouldBeDisabled(
          'input[type=datetime-local]',
          {
            type: 'string',
            format: 'date-time',
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable an alternative date widget', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date',
          },
          uiSchema: {
            'ui:disabled': true,
            'ui:widget': 'alt-date',
          },
        });

        const disabled = [].map.call(node.querySelectorAll('select'), node => node.disabled);
        expect(disabled).toStrictEqual([true, true, true]);
      });

      it('should disable an alternative datetime widget', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date-time',
          },
          uiSchema: {
            'ui:disabled': true,
            'ui:widget': 'alt-datetime',
          },
        });

        const disabled = [].map.call(node.querySelectorAll('select'), node => node.disabled);
        expect(disabled).toStrictEqual([true, true, true, true, true, true]);
      });
    });
  });

  describe('Readonly', () => {
    describe('Fields', () => {
      describe('ArrayField', () => {
        let node;

        beforeEach(() => {
          const schema = {
            type: 'array',
            items: {
              type: 'string',
            },
          };
          const uiSchema = {
            'ui:readonly': true,
          };
          const formData = ['a', 'b'];

          const rendered = createFormComponent({
            schema,
            uiSchema,
            formData,
          });
          node = rendered.node;
        });

        it('should mark as readonly an ArrayField', () => {
          const disabled = [].map.call(node.querySelectorAll('[type=text]'), node => node.hasAttribute('readonly'));
          expect(disabled).toStrictEqual([true, true]);
        });

        it('should disable the Add button', () => {
          expect(node.querySelector('.array-item-add button')).toBeDisabled();
        });

        it('should disable the Delete button', () => {
          expect(node.querySelector('.array-item-remove')).toBeDisabled();
        });
      });

      describe('ObjectField', () => {
        let node;

        beforeEach(() => {
          const schema = {
            type: 'object',
            properties: {
              foo: {
                type: 'string',
              },
              bar: {
                type: 'string',
              },
            },
          };
          const uiSchema = {
            'ui:readonly': true,
          };

          const rendered = createFormComponent({ schema, uiSchema });
          node = rendered.node;
        });

        it('should mark as readonly an ObjectField', () => {
          const disabled = [].map.call(node.querySelectorAll('[type=text]'), node => node.hasAttribute('readonly'));
          expect(disabled).toStrictEqual([true, true]);
        });
      });
    });

    describe('Widgets', () => {
      function shouldBeReadonly(selector, schema, uiSchema) {
        const { node } = createFormComponent({ schema, uiSchema });
        expect(node.querySelector(selector)).toHaveAttribute('readonly');
      }
      function shouldBeDisabled(selector, schema, uiSchema) {
        const { node } = createFormComponent({ schema, uiSchema });
        expect(node.querySelector(selector)).toBeDisabled();
      }

      it('should mark as readonly a text widget', () => {
        shouldBeReadonly(
          'input[type=text]',
          {
            type: 'string',
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a file widget', () => {
        // We mark a file widget as readonly by disabling it.
        const { node } = createFormComponent({
          schema: {
            type: 'string',
            format: 'data-url',
          },
          uiSchema: {
            'ui:readonly': true,
          },
        });
        expect(node.querySelector('input[type=file]')).toHaveAttribute('disabled');
      });

      it('should mark as readonly a textarea widget', () => {
        shouldBeReadonly(
          'textarea',
          {
            type: 'string',
          },
          {
            'ui:readonly': true,
            'ui:widget': 'textarea',
          }
        );
      });

      it('should mark as readonly a number text widget', () => {
        shouldBeReadonly(
          'input[type=number]',
          {
            type: 'number',
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a number widget', () => {
        shouldBeReadonly(
          'input[type=number]',
          {
            type: 'number',
          },
          {
            'ui:readonly': true,
            'ui:widget': 'updown',
          }
        );
      });

      it('should mark as readonly a range widget', () => {
        shouldBeReadonly(
          'input[type=range]',
          {
            type: 'number',
          },
          {
            'ui:readonly': true,
            'ui:widget': 'range',
          }
        );
      });

      it('should mark readonly as disabled on a select widget', () => {
        shouldBeDisabled(
          'select',
          {
            type: 'string',
            enum: ['a', 'b'],
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a color widget', () => {
        shouldBeReadonly(
          'input[type=color]',
          {
            type: 'string',
            format: 'color',
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a password widget', () => {
        shouldBeReadonly(
          'input[type=password]',
          {
            type: 'string',
          },
          {
            'ui:readonly': true,
            'ui:widget': 'password',
          }
        );
      });

      it('should mark as readonly a url widget', () => {
        shouldBeReadonly(
          'input[type=url]',
          {
            type: 'string',
            format: 'uri',
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly an email widget', () => {
        shouldBeReadonly(
          'input[type=email]',
          {
            type: 'string',
            format: 'email',
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a date widget', () => {
        shouldBeReadonly(
          'input[type=date]',
          {
            type: 'string',
            format: 'date',
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a datetime widget', () => {
        shouldBeReadonly(
          'input[type=datetime-local]',
          {
            type: 'string',
            format: 'date-time',
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark readonly as disabled on an alternative date widget', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date',
          },
          uiSchema: {
            'ui:readonly': true,
            'ui:widget': 'alt-date',
          },
        });

        const readonly = [].map.call(node.querySelectorAll('select'), node => node.hasAttribute('disabled'));
        expect(readonly).toStrictEqual([true, true, true]);
      });

      it('should mark readonly as disabled on an alternative datetime widget', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date-time',
          },
          uiSchema: {
            'ui:readonly': true,
            'ui:widget': 'alt-datetime',
          },
        });

        const readonly = [].map.call(node.querySelectorAll('select'), node => node.hasAttribute('disabled'));
        expect(readonly).toStrictEqual([true, true, true, true, true, true]);
      });
    });
  });

  describe('Readonly in schema', () => {
    describe('Fields', () => {
      describe('ArrayField', () => {
        let node;

        beforeEach(() => {
          const schema = {
            type: 'array',
            items: {
              type: 'string',
            },
            readOnly: true,
          };
          const uiSchema = {};
          const formData = ['a', 'b'];

          const rendered = createFormComponent({ schema, uiSchema, formData });
          node = rendered.node;
        });

        it('should mark as readonly an ArrayField', () => {
          const disabled = [].map.call(node.querySelectorAll('[type=text]'), node => node.hasAttribute('readonly'));
          expect(disabled).toStrictEqual([true, true]);
        });

        it('should disable the Add button', () => {
          expect(node.querySelector('.array-item-add button')).toBeDisabled();
        });

        it('should disable the Delete button', () => {
          expect(node.querySelector('.array-item-remove')).toBeDisabled();
        });
      });

      describe('ObjectField', () => {
        let node;

        beforeEach(() => {
          const schema = {
            type: 'object',
            properties: {
              foo: {
                type: 'string',
              },
              bar: {
                type: 'string',
              },
            },
            readOnly: true,
          };
          const uiSchema = {};

          const rendered = createFormComponent({ schema, uiSchema });
          node = rendered.node;
        });

        it('should mark as readonly an ObjectField', () => {
          const disabled = [].map.call(node.querySelectorAll('[type=text]'), node => node.hasAttribute('readonly'));
          expect(disabled).toStrictEqual([true, true]);
        });
      });
    });

    describe('Widgets', () => {
      function shouldBeReadonly(selector, schema, uiSchema) {
        const { node } = createFormComponent({ schema, uiSchema });
        expect(node.querySelector(selector)).toHaveAttribute('readonly');
      }
      function shouldBeDisabled(selector, schema, uiSchema) {
        const { node } = createFormComponent({ schema, uiSchema });
        expect(node.querySelector(selector)).toBeDisabled();
      }

      it('should mark as readonly a text widget', () => {
        shouldBeReadonly(
          'input[type=text]',
          {
            type: 'string',
            readOnly: true,
          },
          {}
        );
      });

      it('should mark as readonly a file widget', () => {
        // We mark a file widget as readonly by disabling it.
        const { node } = createFormComponent({
          schema: {
            type: 'string',
            format: 'data-url',
            readOnly: true,
          },
          uiSchema: {},
        });
        expect(node.querySelector('input[type=file]')).toHaveAttribute('disabled');
      });

      it('should mark as readonly a textarea widget', () => {
        shouldBeReadonly(
          'textarea',
          {
            type: 'string',
            readOnly: true,
          },
          {
            'ui:widget': 'textarea',
          }
        );
      });

      it('should mark as readonly a number text widget', () => {
        shouldBeReadonly(
          'input[type=number]',
          {
            type: 'number',
            readOnly: true,
          },
          {}
        );
      });

      it('should mark as readonly a number widget', () => {
        shouldBeReadonly(
          'input[type=number]',
          {
            type: 'number',
            readOnly: true,
          },
          {
            'ui:widget': 'updown',
          }
        );
      });

      it('should mark as readonly a range widget', () => {
        shouldBeReadonly(
          'input[type=range]',
          {
            type: 'number',
            readOnly: true,
          },
          {
            'ui:widget': 'range',
          }
        );
      });

      it('should mark readonly as disabled on a select widget', () => {
        shouldBeDisabled(
          'select',
          {
            type: 'string',
            enum: ['a', 'b'],
            readOnly: true,
          },
          {}
        );
      });

      it('should mark as readonly a color widget', () => {
        shouldBeReadonly(
          'input[type=color]',
          {
            type: 'string',
            format: 'color',
            readOnly: true,
          },
          {}
        );
      });

      it('should mark as readonly a password widget', () => {
        shouldBeReadonly(
          'input[type=password]',
          {
            type: 'string',
            readOnly: true,
          },
          {
            'ui:widget': 'password',
          }
        );
      });

      it('should mark as readonly a url widget', () => {
        shouldBeReadonly(
          'input[type=url]',
          {
            type: 'string',
            format: 'uri',
            readOnly: true,
          },
          {}
        );
      });

      it('should mark as readonly an email widget', () => {
        shouldBeReadonly('input[type=email]', {
          type: 'string',
          format: 'email',
          readOnly: true,
        });
      });

      it('should mark as readonly a date widget', () => {
        shouldBeReadonly('input[type=date]', {
          type: 'string',
          format: 'date',
          readOnly: true,
        });
      });

      it('should mark as readonly a datetime widget', () => {
        shouldBeReadonly('input[type=datetime-local]', {
          type: 'string',
          format: 'date-time',
          readOnly: true,
        });
      });

      it('should mark readonly as disabled on an alternative date widget', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date',
            readOnly: true,
          },
          uiSchema: {
            'ui:widget': 'alt-date',
          },
        });

        const readonly = [].map.call(node.querySelectorAll('select'), node => node.hasAttribute('disabled'));
        expect(readonly).toStrictEqual([true, true, true]);
      });

      it('should mark readonly as disabled on an alternative datetime widget', () => {
        const { node } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date-time',
            readOnly: true,
          },
          uiSchema: {
            'ui:widget': 'alt-datetime',
          },
        });

        const readonly = [].map.call(node.querySelectorAll('select'), node => node.hasAttribute('disabled'));
        expect(readonly).toStrictEqual([true, true, true, true, true, true]);
      });
    });
  });
});
