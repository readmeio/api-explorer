/* eslint-disable global-require */
/* eslint-disable react/no-find-dom-node */
/* eslint-disable max-classes-per-file */
import React from 'react';
import { renderIntoDocument, Simulate } from 'react-dom/test-utils';
import { findDOMNode } from 'react-dom';
import { Portal } from 'react-portal';
import { createRef } from 'create-react-ref';

import Form from '../src';
import { createComponent, createFormComponent, setProps, submitForm } from './test_utils';

const formExtraPropsList = [
  [{ omitExtraData: false }],
  [{ omitExtraData: true }],
  [{ omitExtraData: true, liveOmit: true }],
];

describe.each(formExtraPropsList)('Form with props: `%s`', formExtraProps => {
  let createFormComponentFn;

  beforeAll(() => {
    createFormComponentFn = props => createFormComponent({ ...props, ...formExtraProps });
  });

  describe('Empty schema', () => {
    it('should render a form tag', () => {
      const { node } = createFormComponentFn({ schema: {} });

      expect(node.tagName).toBe('FORM');
    });

    it('should render a submit button', () => {
      const { node } = createFormComponent({ schema: {} });

      expect(node.querySelectorAll('button[type=submit]')).toHaveLength(1);
    });

    it('should render children buttons', () => {
      const props = { schema: {} };
      const comp = renderIntoDocument(
        <Form {...props}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );
      const node = findDOMNode(comp);
      expect(node.querySelectorAll('button[type=submit]')).toHaveLength(2);
    });

    it("should render errors if schema isn't object", () => {
      const props = {
        schema: {
          type: 'object',
          title: 'object',
          properties: {
            firstName: 'some mame',
            address: {
              $ref: '#/definitions/address',
            },
          },
          definitions: {
            address: {
              street: 'some street',
            },
          },
        },
      };
      const comp = renderIntoDocument(
        <Form {...props}>
          <button type="submit">Submit</button>
        </Form>
      );
      const node = findDOMNode(comp);
      expect(node.querySelector('.unsupported-field')).toHaveTextContent('Unknown field type undefined');
    });
  });

  describe('on component creation', () => {
    let onChangeProp;
    let formData;
    let schema;

    function createComponent() {
      renderIntoDocument(
        <Form formData={formData} onChange={onChangeProp} schema={schema}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );
    }

    beforeEach(() => {
      onChangeProp = jest.fn();
      schema = {
        type: 'object',
        title: 'root object',
        required: ['count'],
        properties: {
          count: {
            type: 'number',
            default: 789,
          },
        },
      };
    });

    describe('when props.formData does not equal the default values', () => {
      beforeEach(() => {
        formData = {
          foo: 123,
        };
        createComponent();
      });

      it('should call props.onChange with current state', () => {
        expect(onChangeProp).toHaveBeenCalledTimes(1);
        expect(onChangeProp).toHaveBeenCalledWith({
          formData: { ...formData, count: 789 },
          schema,
          errorSchema: {},
          errors: [],
          edit: true,
          uiSchema: {},
          idSchema: { $id: 'root', count: { $id: 'root_count' } },
          additionalMetaSchemas: undefined,
        });
      });
    });

    describe('when props.formData equals the default values', () => {
      beforeEach(() => {
        formData = {
          count: 789,
        };
        createComponent();
      });

      it('should not call props.onChange', () => {
        expect(onChangeProp).not.toHaveBeenCalled();
      });
    });
  });

  describe('Option idPrefix', function () {
    it('should change the rendered ids', function () {
      const schema = {
        type: 'object',
        title: 'root object',
        required: ['foo'],
        properties: {
          count: {
            type: 'number',
          },
        },
      };
      const comp = renderIntoDocument(<Form idPrefix="rjsf" schema={schema} />);
      const node = findDOMNode(comp);
      const inputs = node.querySelectorAll('input');
      const ids = [];
      for (let i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute('id'));
      }
      expect(ids).toStrictEqual(['rjsf_count']);
      expect(node.querySelector('fieldset').id).toBe('rjsf');
    });
  });

  describe('Changing idPrefix', function () {
    it('should work with simple example', function () {
      const schema = {
        type: 'object',
        title: 'root object',
        required: ['foo'],
        properties: {
          count: {
            type: 'number',
          },
        },
      };
      const comp = renderIntoDocument(<Form idPrefix="rjsf" schema={schema} />);
      const node = findDOMNode(comp);
      const inputs = node.querySelectorAll('input');
      const ids = [];
      for (let i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute('id'));
      }
      expect(ids).toStrictEqual(['rjsf_count']);
      expect(node.querySelector('fieldset').id).toBe('rjsf');
    });

    it('should work with oneOf', function () {
      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        type: 'object',
        properties: {
          connector: {
            type: 'string',
            enum: ['aws', 'gcp'],
            title: 'Provider',
            default: 'aws',
          },
        },
        dependencies: {
          connector: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  connector: {
                    type: 'string',
                    enum: ['aws'],
                  },
                  key_aws: {
                    type: 'string',
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  connector: {
                    type: 'string',
                    enum: ['gcp'],
                  },
                  key_gcp: {
                    type: 'string',
                  },
                },
              },
            ],
          },
        },
      };

      const comp = renderIntoDocument(<Form idPrefix="rjsf" schema={schema} />);
      const node = findDOMNode(comp);
      const inputs = node.querySelectorAll('input');
      const ids = [];
      for (let i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute('id'));
      }
      expect(ids).toStrictEqual(['rjsf_key_aws']);
    });
  });

  describe('Custom field template', () => {
    const schema = {
      type: 'object',
      title: 'root object',
      required: ['foo'],
      properties: {
        foo: {
          type: 'string',
          description: 'this is description',
          minLength: 32,
        },
      },
    };

    const uiSchema = {
      foo: {
        'ui:help': 'this is help',
      },
    };

    const formData = { foo: 'invalid' };

    function FieldTemplate(props) {
      const {
        id,
        classNames,
        label,
        help,
        rawHelp,
        required,
        description,
        rawDescription,
        errors,
        rawErrors,
        children,
      } = props;
      return (
        <div className={`my-template ${classNames}`}>
          <label htmlFor={id}>
            {label}
            {required ? '*' : null}
          </label>
          {description}
          {children}
          {errors}
          {help}
          <span className="raw-help">{`${rawHelp} rendered from the raw format`}</span>
          <span className="raw-description">{`${rawDescription} rendered from the raw format`}</span>
          {rawErrors ? (
            <ul>
              {rawErrors.map((error, i) => (
                <li key={i} className="raw-error">
                  {error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }

    let node;

    beforeEach(() => {
      node = createFormComponent({
        schema,
        uiSchema,
        formData,
        FieldTemplate,
        liveValidate: true,
      }).node;
    });

    it('should use the provided field template', () => {
      expect(node.querySelector('.my-template')).not.toBeNull();
    });

    it('should use the provided template for labels', () => {
      expect(node.querySelector('.my-template > label')).toHaveTextContent('root object');
      expect(node.querySelector('.my-template .field-string > label')).toHaveTextContent('foo*');
    });

    it('should pass description as the provided React element', () => {
      expect(node.querySelector('#root_foo__description')).toHaveTextContent('this is description');
    });

    it('should pass rawDescription as a string', () => {
      expect(node.querySelector('.raw-description')).toHaveTextContent(
        'this is description rendered from the raw format'
      );
    });

    it('should pass errors as the provided React component', () => {
      expect(node.querySelectorAll('.error-detail li')).toHaveLength(1);
    });

    it('should pass rawErrors as an array of strings', () => {
      expect(node.querySelectorAll('.raw-error')).toHaveLength(1);
    });

    it('should pass help as a the provided React element', () => {
      expect(node.querySelector('.help-block')).toHaveTextContent('this is help');
    });

    it('should pass rawHelp as a string', () => {
      expect(node.querySelector('.raw-help')).toHaveTextContent('this is help rendered from the raw format');
    });
  });

  describe('Schema definitions', () => {
    it('should use a single schema definition reference', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' },
        },
        $ref: '#/definitions/testdef',
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should recursively handle refer multiple schema definition references', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' },
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' },
          bar: { $ref: '#/definitions/testdef' },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(2);
    });

    it('should handle deeply referenced schema definitions', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' },
        },
        type: 'object',
        properties: {
          foo: {
            type: 'object',
            properties: {
              bar: { $ref: '#/definitions/testdef' },
            },
          },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should handle references to deep schema definitions', () => {
      const schema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              bar: { type: 'string' },
            },
          },
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef/properties/bar' },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should handle referenced definitions for array items', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' },
        },
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: { $ref: '#/definitions/testdef' },
          },
        },
      };

      const { node } = createFormComponent({
        schema,
        formData: {
          foo: ['blah'],
        },
      });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should raise for non-existent definitions referenced', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/nonexistent' },
        },
      };

      expect(() => createFormComponent({ schema })).toThrow(/#\/definitions\/nonexistent/);
    });

    it('should propagate referenced definition defaults', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string', default: 'hello' },
        },
        $ref: '#/definitions/testdef',
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelector('input[type=text]').value).toBe('hello');
    });

    it('should propagate nested referenced definition defaults', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string', default: 'hello' },
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelector('input[type=text]').value).toBe('hello');
    });

    it('should propagate referenced definition defaults for array items', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string', default: 'hello' },
        },
        type: 'array',
        items: {
          $ref: '#/definitions/testdef',
        },
      };

      const { node } = createFormComponent({ schema });

      Simulate.click(node.querySelector('.array-item-add button'));

      expect(node.querySelector('input[type=text]').value).toBe('hello');
    });

    it('should propagate referenced definition defaults in objects with additionalProperties', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' },
        },
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/testdef',
        },
      };

      const { node } = createFormComponent({ schema });

      Simulate.click(node.querySelector('.btn-add'));

      expect(node.querySelector('input[type=text]').value).toBe('newKey');
    });

    it('should propagate referenced definition defaults in objects with additionalProperties that have a type present', () => {
      // Though `additionalProperties` has a `type` present here, it also has a `$ref` so that
      // referenced schema should override it.
      const schema = {
        definitions: {
          testdef: { type: 'number' },
        },
        type: 'object',
        additionalProperties: {
          type: 'string',
          $ref: '#/definitions/testdef',
        },
      };

      const { node } = createFormComponent({ schema });

      Simulate.click(node.querySelector('.btn-add'));

      expect(node.querySelector('input[type=number]').value).toBe('0');
    });

    it('should follow recursive references', () => {
      const schema = {
        definitions: {
          bar: { $ref: '#/definitions/qux' },
          qux: { type: 'string' },
        },
        type: 'object',
        required: ['foo'],
        properties: {
          foo: { $ref: '#/definitions/bar' },
        },
      };
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should follow multiple recursive references', () => {
      const schema = {
        definitions: {
          bar: { $ref: '#/definitions/bar2' },
          bar2: { $ref: '#/definitions/qux' },
          qux: { type: 'string' },
        },
        type: 'object',
        required: ['foo'],
        properties: {
          foo: { $ref: '#/definitions/bar' },
        },
      };
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should priorize definition over schema type property', () => {
      // Refs bug #140
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          childObj: {
            type: 'object',
            $ref: '#/definitions/childObj',
          },
        },
        definitions: {
          childObj: {
            type: 'object',
            properties: {
              otherName: { type: 'string' },
            },
          },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=text]')).toHaveLength(2);
    });

    it('should priorize local properties over definition ones', () => {
      // Refs bug #140
      const schema = {
        type: 'object',
        properties: {
          foo: {
            title: 'custom title',
            $ref: '#/definitions/objectDef',
          },
        },
        definitions: {
          objectDef: {
            type: 'object',
            title: 'definition title',
            properties: {
              field: { type: 'string' },
            },
          },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelector('legend')).toHaveTextContent('custom title');
    });

    it('should propagate and handle a resolved schema definition', () => {
      const schema = {
        definitions: {
          enumDef: { type: 'string', enum: ['a', 'b'] },
        },
        type: 'object',
        properties: {
          name: { $ref: '#/definitions/enumDef' },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('option')).toHaveLength(3);
    });
  });

  describe('Default value handling on clear', () => {
    const schema = {
      type: 'string',
      default: 'foo',
    };

    it('should not set default when a text field is cleared', () => {
      const { node } = createFormComponent({ schema, formData: 'bar' });

      Simulate.change(node.querySelector('input'), {
        target: { value: '' },
      });

      expect(node.querySelector('input').value).toBe('');
    });
  });

  describe('Defaults array items default propagation', () => {
    const schema = {
      type: 'object',
      title: 'lvl 1 obj',
      properties: {
        object: {
          type: 'object',
          title: 'lvl 2 obj',
          properties: {
            array: {
              type: 'array',
              items: {
                type: 'object',
                title: 'lvl 3 obj',
                properties: {
                  bool: {
                    type: 'boolean',
                    default: true,
                  },
                },
              },
            },
          },
        },
      },
    };

    it('should propagate deeply nested defaults to submit handler', () => {
      const { node, onSubmit } = createFormComponent({ schema });

      Simulate.click(node.querySelector('.array-item-add button'));
      Simulate.submit(node);

      expect(onSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: {
            object: {
              array: [
                {
                  bool: true,
                },
              ],
            },
          },
        }),
        expect.anything()
      );
    });
  });

  describe('Submit handler', () => {
    it('should call provided submit handler with form state', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
      };
      const formData = {
        foo: 'bar',
      };
      const onSubmit = jest.fn();
      const event = { type: 'submit' };
      const { node } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      Simulate.submit(node, event);
      expect(onSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({ formData, schema }),
        expect.objectContaining(event)
      );
    });

    it('should not call provided submit handler on validation errors', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            minLength: 1,
          },
        },
      };
      const formData = {
        foo: '',
      };
      const onSubmit = jest.fn();
      const onError = jest.fn();
      const { node } = createFormComponent({
        schema,
        formData,
        onSubmit,
        onError,
      });

      Simulate.submit(node);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Change handler', () => {
    it('should call provided change handler on form state change', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
        },
      };
      const formData = {
        foo: '',
      };
      const onChange = jest.fn();
      const { node } = createFormComponent({
        schema,
        formData,
        onChange,
      });

      Simulate.change(node.querySelector('[type=text]'), {
        target: { value: 'new' },
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: {
            foo: 'new',
          },
        })
      );
    });
  });

  describe('Blur handler', () => {
    it('should call provided blur handler on form input blur event', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
        },
      };
      const formData = {
        foo: '',
      };
      const onBlur = jest.fn();
      const { node } = createFormComponent({ schema, formData, onBlur });

      const input = node.querySelector('[type=text]');
      Simulate.blur(input, {
        target: { value: 'new' },
      });

      expect(onBlur).toHaveBeenCalledWith(input.id, 'new');
    });
  });

  describe('Focus handler', () => {
    it('should call provided focus handler on form input focus event', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
        },
      };
      const formData = {
        foo: '',
      };
      const onFocus = jest.fn();
      const { node } = createFormComponent({ schema, formData, onFocus });

      const input = node.querySelector('[type=text]');
      Simulate.focus(input, {
        target: { value: 'new' },
      });

      expect(onFocus).toHaveBeenCalledWith(input.id, 'new');
    });
  });

  describe('Error handler', () => {
    it('should call provided error handler on validation errors', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            minLength: 1,
          },
        },
      };
      const formData = {
        foo: '',
      };
      const onError = jest.fn();
      const { node } = createFormComponent({ schema, formData, onError });

      Simulate.submit(node);

      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Schema and external formData updates', () => {
    let comp;
    let onChangeProp;
    let formProps;

    beforeEach(() => {
      onChangeProp = jest.fn();
      formProps = {
        schema: {
          type: 'string',
          default: 'foobar',
        },
        formData: 'some value',
        onChange: onChangeProp,
      };
      comp = createFormComponent(formProps).comp;
    });

    describe('when the form data is set to null', () => {
      beforeEach(() =>
        setProps(comp, {
          ...formProps,
          formData: null,
        })
      );

      it('should call onChange', () => {
        expect(onChangeProp).toHaveBeenCalledTimes(1);
        expect(onChangeProp).toHaveBeenCalledWith({
          additionalMetaSchemas: undefined,
          edit: true,
          errorSchema: {},
          errors: [],
          formData: 'foobar',
          idSchema: { $id: 'root' },
          schema: formProps.schema,
          uiSchema: {},
        });
      });
    });

    describe('when the schema default is changed but formData is not changed', () => {
      const newSchema = {
        type: 'string',
        default: 'the new default',
      };

      beforeEach(() =>
        setProps(comp, {
          ...formProps,
          schema: newSchema,
          formData: 'some value',
        })
      );

      it('should not call onChange', () => {
        expect(onChangeProp).not.toHaveBeenCalled();
      });
    });

    describe('when the schema default is changed and formData is changed', () => {
      const newSchema = {
        type: 'string',
        default: 'the new default',
      };

      beforeEach(() =>
        setProps(comp, {
          ...formProps,
          schema: newSchema,
          formData: 'something else',
        })
      );

      it('should not call onChange', () => {
        expect(onChangeProp).not.toHaveBeenCalled();
      });
    });

    describe('when the schema default is changed and formData is nulled', () => {
      const newSchema = {
        type: 'string',
        default: 'the new default',
      };

      beforeEach(() =>
        setProps(comp, {
          ...formProps,
          schema: newSchema,
          formData: null,
        })
      );

      it('should call onChange', () => {
        expect(onChangeProp).toHaveBeenCalledTimes(1);
        expect(onChangeProp).toHaveBeenCalledWith(
          expect.objectContaining({
            schema: newSchema,
            formData: 'the new default',
          })
        );
      });
    });

    describe('when the onChange prop sets formData to a falsey value', () => {
      class TestForm extends React.Component {
        constructor() {
          super();

          this.state = {
            formData: {},
          };
        }

        onChange = () => {
          this.setState({ formData: this.props.falseyValue });
        };

        render() {
          const schema = {
            type: 'object',
            properties: {
              value: {
                type: 'string',
              },
            },
          };
          return <Form formData={this.state.formData} onChange={this.onChange} schema={schema} />;
        }
      }

      it.each([[0], [false], [null], [undefined], [NaN]])(
        'should not crash due to "Maximum call stack size exceeded..." with `%s`"',
        falsyValue => {
          // It is expected that this will throw an error due to non-matching propTypes,
          // so the error message needs to be inspected
          expect(() => {
            createComponent(TestForm, { falsyValue });
          }).not.toThrow('Maximum call stack size exceeded');
        }
      );
    });
  });

  describe('External formData updates', () => {
    describe('root level', () => {
      const formProps = {
        schema: { type: 'string' },
        liveValidate: true,
      };

      it('should call submit handler with new formData prop value', () => {
        const { comp, node, onSubmit } = createFormComponent(formProps);

        setProps(comp, {
          ...formProps,
          onSubmit,
          formData: 'yo',
        });
        submitForm(node);
        expect(onSubmit).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: 'yo',
          }),
          expect.anything()
        );
      });

      it('should validate formData when the schema is updated', () => {
        const { comp, node, onError } = createFormComponent(formProps);

        setProps(comp, {
          ...formProps,
          onError,
          formData: 'yo',
          schema: { type: 'number' },
        });
        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should be number',
              name: 'type',
              params: { type: 'number' },
              property: '',
              schemaPath: '#/type',
              stack: 'should be number',
            },
          ])
        );
      });
    });

    describe('object level', () => {
      it('should call submit handler with new formData prop value', () => {
        const formProps = {
          schema: { type: 'object', properties: { foo: { type: 'string' } } },
        };
        const { comp, onSubmit, node } = createFormComponent(formProps);

        setProps(comp, {
          ...formProps,
          onSubmit,
          formData: { foo: 'yo' },
        });

        submitForm(node);
        expect(onSubmit).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: { foo: 'yo' },
          }),
          expect.anything()
        );
      });
    });

    describe('array level', () => {
      it('should call submit handler with new formData prop value', () => {
        const schema = {
          type: 'array',
          items: {
            type: 'string',
          },
        };
        const { comp, node, onSubmit } = createFormComponent({ schema });

        setProps(comp, { schema, onSubmit, formData: ['yo'] });

        submitForm(node);
        expect(onSubmit).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: ['yo'],
          }),
          expect.anything()
        );
      });
    });
  });

  describe('Internal formData updates', () => {
    it('root', () => {
      const formProps = {
        schema: { type: 'string' },
        liveValidate: true,
      };
      const { node, onChange } = createFormComponent(formProps);

      Simulate.change(node.querySelector('input[type=text]'), {
        target: { value: 'yo' },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: 'yo',
        })
      );
    });

    it('object', () => {
      const { node, onChange } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
      });

      Simulate.change(node.querySelector('input[type=text]'), {
        target: { value: 'yo' },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: { foo: 'yo' },
        })
      );
    });

    it('array of strings', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string',
        },
      };
      const { node, onChange } = createFormComponent({ schema });

      Simulate.click(node.querySelector('.array-item-add button'));

      Simulate.change(node.querySelector('input[type=text]'), {
        target: { value: 'yo' },
      });
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: ['yo'],
        })
      );
    });

    it('array of objects', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      };
      const { node, onChange } = createFormComponent({ schema });

      Simulate.click(node.querySelector('.array-item-add button'));

      Simulate.change(node.querySelector('input[type=text]'), {
        target: { value: 'yo' },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: [{ name: 'yo' }],
        })
      );
    });

    it('dependency with array of objects', () => {
      const schema = {
        definitions: {},
        type: 'object',
        properties: {
          show: {
            type: 'boolean',
          },
        },
        dependencies: {
          show: {
            oneOf: [
              {
                properties: {
                  show: {
                    const: true,
                  },
                  participants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      };
      const { node, onChange } = createFormComponent({ schema });

      Simulate.change(node.querySelector('[type=checkbox]'), {
        target: { checked: true },
      });

      Simulate.click(node.querySelector('.array-item-add button'));

      Simulate.change(node.querySelector('input[type=text]'), {
        target: { value: 'yo' },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: {
            show: true,
            participants: [{ name: 'yo' }],
          },
        })
      );
    });
  });

  describe('Error contextualization', () => {
    describe('on form state updated', () => {
      const schema = {
        type: 'string',
        minLength: 8,
      };

      describe('Lazy validation', () => {
        it('should not update the errorSchema when the formData changes', () => {
          const { node, onChange } = createFormComponent({ schema });

          Simulate.change(node.querySelector('input[type=text]'), {
            target: { value: 'short' },
          });

          expect(onChange).toHaveBeenLastCalledWith(
            expect.not.objectContaining({
              errorSchema: undefined,
            })
          );
        });

        it('should not denote an error in the field', () => {
          const { node } = createFormComponent({ schema });

          Simulate.change(node.querySelector('input[type=text]'), {
            target: { value: 'short' },
          });

          expect(node.querySelectorAll('.field-error')).toHaveLength(0);
        });

        it("should clean contextualized errors up when they're fixed", () => {
          const altSchema = {
            type: 'object',
            properties: {
              field1: { type: 'string', minLength: 8 },
              field2: { type: 'string', minLength: 8 },
            },
          };
          const { node } = createFormComponent({
            schema: altSchema,
            formData: {
              field1: 'short',
              field2: 'short',
            },
          });

          Simulate.submit(node);

          // Fix the first field
          Simulate.change(node.querySelectorAll('input[type=text]')[0], {
            target: { value: 'fixed error' },
          });
          Simulate.submit(node);

          expect(node.querySelectorAll('.field-error')).toHaveLength(1);

          // Fix the second field
          Simulate.change(node.querySelectorAll('input[type=text]')[1], {
            target: { value: 'fixed error too' },
          });
          Simulate.submit(node);

          // No error remaining, shouldn't throw.
          Simulate.submit(node);

          expect(node.querySelectorAll('.field-error')).toHaveLength(0);
        });
      });

      describe('Live validation', () => {
        it('should update the errorSchema when the formData changes', () => {
          const { node, onChange } = createFormComponent({
            schema,
            liveValidate: true,
          });

          Simulate.change(node.querySelector('input[type=text]'), {
            target: { value: 'short' },
          });

          expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
              errorSchema: {
                __errors: ['should NOT be shorter than 8 characters'],
              },
            })
          );
        });

        it('should denote the new error in the field', () => {
          const { node } = createFormComponent({
            schema,
            liveValidate: true,
          });

          Simulate.change(node.querySelector('input[type=text]'), {
            target: { value: 'short' },
          });

          expect(node.querySelectorAll('.field-error')).toHaveLength(1);
          expect(node.querySelector('.field-string .error-detail')).toHaveTextContent(
            'should NOT be shorter than 8 characters'
          );
        });
      });

      describe('Disable validation onChange event', () => {
        it('should not update errorSchema when the formData changes', () => {
          const { node, onChange } = createFormComponent({
            schema,
            noValidate: true,
            liveValidate: true,
          });

          Simulate.change(node.querySelector('input[type=text]'), {
            target: { value: 'short' },
          });

          expect(onChange).toHaveBeenLastCalledWith(
            expect.not.objectContaining({
              errorSchema: undefined,
            })
          );
        });
      });

      describe('Disable validation onSubmit event', () => {
        it('should not update errorSchema when the formData changes', () => {
          const { node, onSubmit } = createFormComponent({
            schema,
            noValidate: true,
          });

          Simulate.change(node.querySelector('input[type=text]'), {
            target: { value: 'short' },
          });
          Simulate.submit(node);

          expect(onSubmit).toHaveBeenLastCalledWith(
            expect.objectContaining({
              errorSchema: {},
            }),
            expect.anything()
          );
        });
      });
    });

    describe('on form submitted', () => {
      const schema = {
        type: 'string',
        minLength: 8,
      };

      it('should call the onError handler', () => {
        const onError = jest.fn();
        const { node } = createFormComponent({ schema, onError });

        Simulate.change(node.querySelector('input[type=text]'), {
          target: { value: 'short' },
        });
        Simulate.submit(node);

        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.stringContaining('should NOT be shorter than 8 characters'),
            }),
          ])
        );
      });

      it('should reset errors and errorSchema state to initial state after correction and resubmission', () => {
        const { node, onError } = createFormComponent({
          schema,
        });

        Simulate.change(node.querySelector('input[type=text]'), {
          target: { value: 'short' },
        });
        Simulate.submit(node);

        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should NOT be shorter than 8 characters',
              name: 'minLength',
              params: { limit: 8 },
              property: '',
              schemaPath: '#/minLength',
              stack: 'should NOT be shorter than 8 characters',
            },
          ])
        );
        expect(onError).toHaveBeenCalledTimes(1);
        onError.mockClear();

        Simulate.change(node.querySelector('input[type=text]'), {
          target: { value: 'long enough' },
        });
        Simulate.submit(node);
        expect(onError).not.toHaveBeenCalled();
      });
    });

    describe('root level', () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: 'string',
          minLength: 8,
        },
        formData: 'short',
      };

      it('should reflect the contextualized error in state', () => {
        const { node, onError } = createFormComponent(formProps);
        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should NOT be shorter than 8 characters',
              name: 'minLength',
              params: { limit: 8 },
              property: '',
              schemaPath: '#/minLength',
              stack: 'should NOT be shorter than 8 characters',
            },
          ])
        );
      });

      it('should denote the error in the field', () => {
        const { node } = createFormComponent(formProps);

        expect(node.querySelectorAll('.field-error')).toHaveLength(1);
        expect(node.querySelector('.field-string .error-detail')).toHaveTextContent(
          'should NOT be shorter than 8 characters'
        );
      });
    });

    describe('root level with multiple errors', () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: 'string',
          minLength: 8,
          pattern: 'd+',
        },
        formData: 'short',
      };

      it('should reflect the contextualized error in state', () => {
        const { node, onError } = createFormComponent(formProps);
        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should NOT be shorter than 8 characters',
              name: 'minLength',
              params: { limit: 8 },
              property: '',
              schemaPath: '#/minLength',
              stack: 'should NOT be shorter than 8 characters',
            },
            {
              message: 'should match pattern "d+"',
              name: 'pattern',
              params: { pattern: 'd+' },
              property: '',
              schemaPath: '#/pattern',
              stack: 'should match pattern "d+"',
            },
          ])
        );
      });

      it('should denote the error in the field', () => {
        const { node } = createFormComponent(formProps);

        const liNodes = node.querySelectorAll('.field-string .error-detail li');
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(errors).toStrictEqual(['should NOT be shorter than 8 characters', 'should match pattern "d+"']);
      });
    });

    describe('nested field level', () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'string',
                minLength: 8,
              },
            },
          },
        },
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: {
          level1: {
            level2: 'short',
          },
        },
      };

      it('should reflect the contextualized error in state', () => {
        const { node, onError } = createFormComponent(formProps);

        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should NOT be shorter than 8 characters',
              name: 'minLength',
              params: { limit: 8 },
              property: '.level1.level2',
              schemaPath: '#/properties/level1/properties/level2/minLength',
              stack: '.level1.level2 should NOT be shorter than 8 characters',
            },
          ])
        );
      });

      it('should denote the error in the field', () => {
        const { node } = createFormComponent(formProps);
        const errorDetail = node.querySelector('.field-object .field-string .error-detail');

        expect(node.querySelectorAll('.field-error')).toHaveLength(1);
        expect(errorDetail).toHaveTextContent('should NOT be shorter than 8 characters');
      });
    });

    describe('array indices', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string',
          minLength: 4,
        },
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: ['good', 'bad', 'good'],
      };

      it('should contextualize the error for array indices', () => {
        const { node, onError } = createFormComponent(formProps);

        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should NOT be shorter than 4 characters',
              name: 'minLength',
              params: { limit: 4 },
              property: '[1]',
              schemaPath: '#/items/minLength',
              stack: '[1] should NOT be shorter than 4 characters',
            },
          ])
        );
      });

      it('should denote the error in the item field in error', () => {
        const { node } = createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll('.field-string');

        const liNodes = fieldNodes[1].querySelectorAll('.field-string .error-detail li');
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(fieldNodes[1]).toHaveClass('field-error');
        expect(errors).toStrictEqual(['should NOT be shorter than 4 characters']);
      });

      it('should not denote errors on non impacted fields', () => {
        const { node } = createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll('.field-string');

        expect(fieldNodes[0]).not.toHaveClass('field-error');
        expect(fieldNodes[2]).not.toHaveClass('field-error');
      });
    });

    describe('nested array indices', () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'array',
            items: {
              type: 'string',
              minLength: 4,
            },
          },
        },
      };

      const formProps = { schema, liveValidate: true };

      it('should contextualize the error for nested array indices', () => {
        const { node, onError } = createFormComponent({
          ...formProps,
          formData: {
            level1: ['good', 'bad', 'good', 'bad'],
          },
        });
        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should NOT be shorter than 4 characters',
              name: 'minLength',
              params: { limit: 4 },
              property: '.level1[1]',
              schemaPath: '#/properties/level1/items/minLength',
              stack: '.level1[1] should NOT be shorter than 4 characters',
            },
            {
              message: 'should NOT be shorter than 4 characters',
              name: 'minLength',
              params: { limit: 4 },
              property: '.level1[3]',
              schemaPath: '#/properties/level1/items/minLength',
              stack: '.level1[3] should NOT be shorter than 4 characters',
            },
          ])
        );
      });

      it('should denote the error in the nested item field in error', () => {
        const { node } = createFormComponent({
          ...formProps,
          formData: {
            level1: ['good', 'bad', 'good'],
          },
        });

        const liNodes = node.querySelectorAll('.field-string .error-detail li');
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(errors).toStrictEqual(['should NOT be shorter than 4 characters']);
      });
    });

    describe('nested arrays', () => {
      const schema = {
        type: 'object',
        properties: {
          outer: {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'string',
                minLength: 4,
              },
            },
          },
        },
      };

      const formData = {
        outer: [
          ['good', 'bad'],
          ['bad', 'good'],
        ],
      };

      const formProps = { schema, formData, liveValidate: true };

      it('should contextualize the error for nested array indices', () => {
        const { node, onError } = createFormComponent(formProps);

        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should NOT be shorter than 4 characters',
              name: 'minLength',
              params: { limit: 4 },
              property: '.outer[0][1]',
              schemaPath: '#/properties/outer/items/items/minLength',
              stack: '.outer[0][1] should NOT be shorter than 4 characters',
            },
            {
              message: 'should NOT be shorter than 4 characters',
              name: 'minLength',
              params: { limit: 4 },
              property: '.outer[1][0]',
              schemaPath: '#/properties/outer/items/items/minLength',
              stack: '.outer[1][0] should NOT be shorter than 4 characters',
            },
          ])
        );
      });

      it('should denote the error in the nested item field in error', () => {
        const { node } = createFormComponent(formProps);
        const fields = node.querySelectorAll('.field-string');
        const errors = [].map.call(fields, field => {
          const li = field.querySelector('.error-detail li');
          return li && li.textContent;
        });

        expect(errors).toStrictEqual([
          null,
          'should NOT be shorter than 4 characters',
          'should NOT be shorter than 4 characters',
          null,
        ]);
      });
    });

    describe('array nested items', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
              minLength: 4,
            },
          },
        },
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: [{ foo: 'good' }, { foo: 'bad' }, { foo: 'good' }],
      };

      it('should contextualize the error for array nested items', () => {
        const { node, onError } = createFormComponent(formProps);

        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should NOT be shorter than 4 characters',
              name: 'minLength',
              params: { limit: 4 },
              property: '[1].foo',
              schemaPath: '#/items/properties/foo/minLength',
              stack: '[1].foo should NOT be shorter than 4 characters',
            },
          ])
        );
      });

      it('should denote the error in the array nested item', () => {
        const { node } = createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll('.field-string');

        const liNodes = fieldNodes[1].querySelectorAll('.field-string .error-detail li');
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(fieldNodes[1]).toHaveClass('field-error');
        expect(errors).toStrictEqual(['should NOT be shorter than 4 characters']);
      });
    });

    describe('schema dependencies', () => {
      const schema = {
        type: 'object',
        properties: {
          branch: {
            type: 'number',
            enum: [1, 2, 3],
            default: 1,
          },
        },
        required: ['branch'],
        dependencies: {
          branch: {
            oneOf: [
              {
                properties: {
                  branch: {
                    enum: [1],
                  },
                  field1: {
                    type: 'number',
                  },
                },
                required: ['field1'],
              },
              {
                properties: {
                  branch: {
                    enum: [2],
                  },
                  field1: {
                    type: 'number',
                  },
                  field2: {
                    type: 'number',
                  },
                },
                required: ['field1', 'field2'],
              },
            ],
          },
        },
      };

      it('should only show error for property in selected branch', () => {
        const { node, onChange } = createFormComponent({
          schema,
          liveValidate: true,
        });

        Simulate.change(node.querySelector('input[type=number]'), {
          target: { value: 'not a number' },
        });

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            errorSchema: { field1: { __errors: ['should be number'] } },
          })
        );
      });

      it('should only show errors for properties in selected branch', () => {
        const { node, onChange } = createFormComponent({
          schema,
          liveValidate: true,
          formData: { branch: 2 },
        });

        Simulate.change(node.querySelector('input[type=number]'), {
          target: { value: 'not a number' },
        });

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            errorSchema: {
              field1: {
                __errors: ['should be number'],
              },
              field2: {
                __errors: ['is a required property'],
              },
            },
          })
        );
      });

      it('should not show any errors when branch is empty', () => {
        const { node, onChange } = createFormComponent({
          schema,
          liveValidate: true,
          formData: { branch: 3 },
        });

        Simulate.change(node.querySelector('select'), {
          target: { value: 3 },
        });

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            errorSchema: {},
          })
        );
      });
    });
  });

  describe('Schema and formData updates', () => {
    // https://github.com/mozilla-services/react-jsonschema-form/issues/231
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
      },
    };

    it('should replace state when props remove formData keys', () => {
      const formData = { foo: 'foo', bar: 'bar' };
      const { comp, node, onChange } = createFormComponent({
        schema,
        formData,
      });

      setProps(comp, {
        onChange,
        schema: {
          type: 'object',
          properties: {
            bar: { type: 'string' },
          },
        },
        formData: { bar: 'bar' },
      });

      Simulate.change(node.querySelector('#root_bar'), {
        target: { value: 'baz' },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: { bar: 'baz' },
        })
      );
    });

    it('should replace state when props change formData keys', () => {
      const formData = { foo: 'foo', bar: 'bar' };
      const { comp, node, onChange } = createFormComponent({
        schema,
        formData,
      });

      setProps(comp, {
        onChange,
        schema: {
          type: 'object',
          properties: {
            foo: { type: 'string' },
            baz: { type: 'string' },
          },
        },
        formData: { foo: 'foo', baz: 'bar' },
      });

      Simulate.change(node.querySelector('#root_baz'), {
        target: { value: 'baz' },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: { foo: 'foo', baz: 'baz' },
        })
      );
    });
  });

  describe('idSchema updates based on formData', () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'string', enum: ['int', 'bool'] },
      },
      dependencies: {
        a: {
          oneOf: [
            {
              properties: {
                a: { enum: ['int'] },
              },
            },
            {
              properties: {
                a: { enum: ['bool'] },
                b: { type: 'boolean' },
              },
            },
          ],
        },
      },
    };

    it('should not update idSchema for a falsey value', () => {
      const formData = { a: 'int' };
      const { comp, node, onSubmit } = createFormComponent({
        schema,
        formData,
      });

      setProps(comp, {
        onSubmit,
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string', enum: ['int', 'bool'] },
          },
          dependencies: {
            a: {
              oneOf: [
                {
                  properties: {
                    a: { enum: ['int'] },
                  },
                },
                {
                  properties: {
                    a: { enum: ['bool'] },
                    b: { type: 'boolean' },
                  },
                },
              ],
            },
          },
        },
        formData: { a: 'int' },
      });

      submitForm(node);
      expect(onSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({
          idSchema: { $id: 'root', a: { $id: 'root_a' } },
        }),
        expect.anything()
      );
    });

    it('should update idSchema based on truthy value', () => {
      const formData = {
        a: 'int',
      };
      const { comp, node, onSubmit } = createFormComponent({
        schema,
        formData,
      });
      setProps(comp, {
        onSubmit,
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string', enum: ['int', 'bool'] },
          },
          dependencies: {
            a: {
              oneOf: [
                {
                  properties: {
                    a: { enum: ['int'] },
                  },
                },
                {
                  properties: {
                    a: { enum: ['bool'] },
                    b: { type: 'boolean' },
                  },
                },
              ],
            },
          },
        },
        formData: { a: 'bool' },
      });
      submitForm(node);
      expect(onSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({
          idSchema: {
            $id: 'root',
            a: { $id: 'root_a' },
            b: { $id: 'root_b' },
          },
        }),
        expect.anything()
      );
    });
  });

  describe('Form disable prop', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
      },
    };
    const formData = { foo: 'foo', bar: 'bar' };

    it('should enable all items', () => {
      const { node } = createFormComponent({ schema, formData });

      expect(node.querySelectorAll('input:disabled')).toHaveLength(0);
    });

    it('should disable all items', () => {
      const { node } = createFormComponent({
        schema,
        formData,
        disabled: true,
      });

      expect(node.querySelectorAll('input:disabled')).toHaveLength(2);
    });
  });

  describe('Attributes', () => {
    const formProps = {
      schema: {},
      id: 'test-form',
      className: 'test-class other-class',
      name: 'testName',
      method: 'post',
      target: '_blank',
      action: '/users/list',
      autoComplete: 'off',
      enctype: 'multipart/form-data',
      acceptcharset: 'ISO-8859-1',
      noHtml5Validate: true,
    };

    let node;

    beforeEach(() => {
      node = createFormComponent(formProps).node;
    });

    it('should set attr id of form', () => {
      expect(node).toHaveAttribute('id', formProps.id);
    });

    it('should set attr class of form', () => {
      expect(node).toHaveAttribute('class', formProps.className);
    });

    it('should set attr name of form', () => {
      expect(node).toHaveAttribute('name', formProps.name);
    });

    it('should set attr method of form', () => {
      expect(node).toHaveAttribute('method', formProps.method);
    });

    it('should set attr target of form', () => {
      expect(node).toHaveAttribute('target', formProps.target);
    });

    it('should set attr action of form', () => {
      expect(node).toHaveAttribute('action', formProps.action);
    });

    it('should set attr autocomplete of form', () => {
      expect(node).toHaveAttribute('autocomplete', formProps.autoComplete);
    });

    it('should set attr enctype of form', () => {
      expect(node).toHaveAttribute('enctype', formProps.enctype);
    });

    it('should set attr acceptcharset of form', () => {
      expect(node).toHaveAttribute('accept-charset', formProps.acceptcharset);
    });

    it('should set attr novalidate of form', () => {
      expect(node.getAttribute('novalidate')).not.toBeNull();
    });
  });

  describe('Deprecated autocomplete attribute', () => {
    it('should set attr autocomplete of form', () => {
      const formProps = {
        schema: {},
        autocomplete: 'off',
      };
      const node = createFormComponent(formProps).node;
      expect(node).toHaveAttribute('autocomplete', formProps.autocomplete);
    });

    it('should log deprecation warning when it is used', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      createFormComponent({
        schema: {},
        autocomplete: 'off',
      });
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringMatching(/Using autocomplete property of Form is deprecated/)
      );
    });

    it('should use autoComplete value if both autocomplete and autoComplete are used', () => {
      const formProps = {
        schema: {},
        autocomplete: 'off',
        autoComplete: 'on',
      };
      const node = createFormComponent(formProps).node;
      expect(node).toHaveAttribute('autocomplete', formProps.autoComplete);
    });
  });

  describe('Custom format updates', () => {
    it('should update custom formats when customFormats is changed', () => {
      const formProps = {
        liveValidate: true,
        formData: {
          areaCode: '123455',
        },
        schema: {
          type: 'object',
          properties: {
            areaCode: {
              type: 'string',
              format: 'area-code',
            },
          },
        },
        uiSchema: {
          areaCode: {
            'ui:widget': 'area-code',
          },
        },
        widgets: {
          'area-code': () => <div id="custom" />,
        },
      };

      const { comp, node, onError } = createFormComponent(formProps);

      submitForm(node);
      expect(onError).not.toHaveBeenCalled();

      setProps(comp, {
        ...formProps,
        onError,
        customFormats: {
          'area-code': /^\d{3}$/,
        },
      });

      submitForm(node);
      expect(onError).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          {
            message: 'should match format "area-code"',
            name: 'format',
            params: { format: 'area-code' },
            property: '.areaCode',
            schemaPath: '#/properties/areaCode/format',
            stack: '.areaCode should match format "area-code"',
          },
        ])
      );
    });
  });

  describe('Meta schema updates', () => {
    it('Should update allowed meta schemas when additionalMetaSchemas is changed', () => {
      const formProps = {
        liveValidate: true,
        schema: {
          $schema: 'http://json-schema.org/draft-04/schema#',
          type: 'string',
          minLength: 8,
          pattern: 'd+',
        },
        formData: 'short',
        additionalMetaSchemas: [],
      };

      const { comp, node, onError } = createFormComponent(formProps);
      submitForm(node);
      expect(onError).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          {
            stack: 'no schema with key or ref "http://json-schema.org/draft-04/schema#"',
          },
        ])
      );

      setProps(comp, {
        ...formProps,
        onError,
        additionalMetaSchemas: [require('ajv/lib/refs/json-schema-draft-04.json')],
      });

      submitForm(node);
      expect(onError).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          {
            message: 'should NOT be shorter than 8 characters',
            name: 'minLength',
            params: { limit: 8 },
            property: '',
            schemaPath: '#/minLength',
            stack: 'should NOT be shorter than 8 characters',
          },
          {
            message: 'should match pattern "d+"',
            name: 'pattern',
            params: { pattern: 'd+' },
            property: '',
            schemaPath: '#/pattern',
            stack: 'should match pattern "d+"',
          },
        ])
      );

      setProps(comp, { ...formProps, onError });

      submitForm(node);
      expect(onError).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          {
            stack: 'no schema with key or ref "http://json-schema.org/draft-04/schema#"',
          },
        ])
      );
    });
  });

  describe('Changing the tagName', () => {
    it('should render the component using the custom tag name', () => {
      const tagName = 'span';
      const { node } = createFormComponent({ schema: {}, tagName });
      expect(node.tagName).toBe(tagName.toUpperCase());
    });

    it('should render the component using a ComponentType', () => {
      const Component = props => <div {...props} id="test" />;
      const { node } = createFormComponent({ schema: {}, tagName: Component });
      expect(node.id).toBe('test');
    });
  });

  describe('Nested forms', () => {
    it('should call provided submit handler with form state', () => {
      const innerOnSubmit = jest.fn();
      const outerOnSubmit = jest.fn();
      let innerRef;

      class ArrayTemplateWithForm extends React.Component {
        constructor(props) {
          super(props);
          innerRef = createRef();
        }

        render() {
          const innerFormProps = {
            schema: {},
            onSubmit: innerOnSubmit,
          };

          return (
            <Portal>
              <div ref={innerRef} className="array">
                <Form {...innerFormProps}>
                  <button className="array-form-submit" type="submit">
                    Submit
                  </button>
                </Form>
              </div>
            </Portal>
          );
        }
      }

      const outerFormProps = {
        schema: {
          type: 'array',
          title: 'my list',
          description: 'my description',
          items: { type: 'string' },
        },
        formData: ['foo', 'bar'],
        ArrayFieldTemplate: ArrayTemplateWithForm,
        onSubmit: outerOnSubmit,
      };
      createFormComponent(outerFormProps);
      const arrayForm = innerRef.current.querySelector('form');
      const arraySubmit = arrayForm.querySelector('.array-form-submit');

      arraySubmit.click();
      expect(innerOnSubmit).toHaveBeenCalledTimes(1);
      expect(outerOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Dependencies', () => {
    it('should not give a validation error by duplicating enum values in dependencies', () => {
      const schema = {
        title: 'A registration form',
        description: 'A simple form example.',
        type: 'object',
        properties: {
          type1: {
            type: 'string',
            title: 'Type 1',
            enum: ['FOO', 'BAR', 'BAZ'],
          },
          type2: {
            type: 'string',
            title: 'Type 2',
            enum: ['GREEN', 'BLUE', 'RED'],
          },
        },
        dependencies: {
          type1: {
            properties: {
              type1: {
                enum: ['FOO'],
              },
              type2: {
                enum: ['GREEN'],
              },
            },
          },
        },
      };
      const formData = {
        type1: 'FOO',
      };
      const { node, onError } = createFormComponent({ schema, formData });
      Simulate.submit(node);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should show dependency defaults for uncontrolled components', () => {
      const schema = {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
        },
        dependencies: {
          firstName: {
            properties: {
              lastName: { type: 'string', default: 'Norris' },
            },
          },
        },
      };
      const { node } = createFormComponent({ schema });

      Simulate.change(node.querySelector('#root_firstName'), {
        target: { value: 'Chuck' },
      });
      expect(node.querySelector('#root_lastName').value).toBe('Norris');
    });
  });
});

describe('Form omitExtraData and liveOmit', () => {
  it('should call getUsedFormData when the omitExtraData prop is true and liveOmit is true', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
        },
      },
    };
    const formData = {
      foo: 'bar',
    };
    const onChange = jest.fn();
    const omitExtraData = true;
    const liveOmit = true;
    const { node, comp } = createFormComponent({
      schema,
      formData,
      onChange,
      omitExtraData,
      liveOmit,
    });

    jest.spyOn(comp, 'getUsedFormData').mockImplementation(() => ({
      foo: '',
    }));

    Simulate.change(node.querySelector('[type=text]'), {
      target: { value: 'new' },
    });

    expect(comp.getUsedFormData).toHaveBeenCalledTimes(1);
  });

  it('should not call getUsedFormData when the omitExtraData prop is true and liveOmit is unspecified', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
        },
      },
    };
    const formData = {
      foo: 'bar',
    };
    const onChange = jest.fn();
    const omitExtraData = true;
    const { node, comp } = createFormComponent({
      schema,
      formData,
      onChange,
      omitExtraData,
    });

    jest.spyOn(comp, 'getUsedFormData').mockImplementation(() => ({
      foo: '',
    }));

    Simulate.change(node.querySelector('[type=text]'), {
      target: { value: 'new' },
    });

    expect(comp.getUsedFormData).not.toHaveBeenCalled();
  });

  describe('getUsedFormData', () => {
    it('should call getUsedFormData when the omitExtraData prop is true', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
        },
      };
      const formData = {
        foo: '',
      };
      const onSubmit = jest.fn();
      const onError = jest.fn();
      const omitExtraData = true;
      const { comp, node } = createFormComponent({
        schema,
        formData,
        onSubmit,
        onError,
        omitExtraData,
      });

      jest.spyOn(comp, 'getUsedFormData').mockImplementation(() => ({
        foo: '',
      }));

      Simulate.submit(node);

      expect(comp.getUsedFormData).toHaveBeenCalledTimes(1);
    });

    it('should just return the single input form value', () => {
      const schema = {
        title: 'A single-field form',
        type: 'string',
      };
      const formData = 'foo';
      const onSubmit = jest.fn();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const result = comp.getUsedFormData(formData, []);
      expect(result).toBe('foo');
    });

    it('should return the root level array', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string',
        },
      };
      const formData = [];
      const onSubmit = jest.fn();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const result = comp.getUsedFormData(formData, []);
      expect(result).toStrictEqual([]);
    });

    it('should call getUsedFormData with data from fields in event', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
      };
      const formData = {
        foo: 'bar',
      };
      const onSubmit = jest.fn();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const result = comp.getUsedFormData(formData, ['foo']);
      expect(result).toStrictEqual({ foo: 'bar' });
    });

    it('unused form values should be omitted', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          baz: { type: 'string' },
          list: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                details: { type: 'string' },
              },
            },
          },
        },
      };

      const formData = {
        foo: 'bar',
        baz: 'buzz',
        list: [
          { title: 'title0', details: 'details0' },
          { title: 'title1', details: 'details1' },
        ],
      };
      const onSubmit = jest.fn();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const result = comp.getUsedFormData(formData, ['foo', 'list.0.title', 'list.1.details']);
      expect(result).toStrictEqual({
        foo: 'bar',
        list: [{ title: 'title0' }, { details: 'details1' }],
      });
    });
  });

  describe('getFieldNames()', () => {
    it('should return an empty array for a single input form', () => {
      const schema = {
        type: 'string',
      };

      const formData = 'foo';

      const onSubmit = jest.fn();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const pathSchema = {
        $name: '',
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames).toStrictEqual([]);
    });

    it('should get field names from pathSchema', () => {
      const schema = {};

      const formData = {
        extra: {
          foo: 'bar',
        },
        level1: {
          level2: 'test',
          anotherThing: {
            anotherThingNested: 'abc',
            extra: 'asdf',
            anotherThingNested2: 0,
          },
        },
        level1a: 1.23,
      };

      const onSubmit = jest.fn();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const pathSchema = {
        $name: '',
        level1: {
          $name: 'level1',
          level2: { $name: 'level1.level2' },
          anotherThing: {
            $name: 'level1.anotherThing',
            anotherThingNested: {
              $name: 'level1.anotherThing.anotherThingNested',
            },
            anotherThingNested2: {
              $name: 'level1.anotherThing.anotherThingNested2',
            },
          },
        },
        level1a: {
          $name: 'level1a',
        },
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames.sort()).toStrictEqual(
        [
          'level1a',
          'level1.level2',
          'level1.anotherThing.anotherThingNested',
          'level1.anotherThing.anotherThingNested2',
        ].sort()
      );
    });

    it('should get field names from pathSchema with array', () => {
      const schema = {};

      const formData = {
        address_list: [
          {
            street_address: '21, Jump Street',
            city: 'Babel',
            state: 'Neverland',
          },
          {
            street_address: '1234 Schema Rd.',
            city: 'New York',
            state: 'Arizona',
          },
        ],
      };

      const onSubmit = jest.fn();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const pathSchema = {
        $name: '',
        address_list: {
          0: {
            $name: 'address_list.0',
            city: {
              $name: 'address_list.0.city',
            },
            state: {
              $name: 'address_list.0.state',
            },
            street_address: {
              $name: 'address_list.0.street_address',
            },
          },
          1: {
            $name: 'address_list.1',
            city: {
              $name: 'address_list.1.city',
            },
            state: {
              $name: 'address_list.1.state',
            },
            street_address: {
              $name: 'address_list.1.street_address',
            },
          },
        },
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames.sort()).toStrictEqual(
        [
          'address_list.0.city',
          'address_list.0.state',
          'address_list.0.street_address',
          'address_list.1.city',
          'address_list.1.state',
          'address_list.1.street_address',
        ].sort()
      );
    });
  });

  it('should not omit data on change with omitExtraData=false and liveOmit=false', () => {
    const omitExtraData = false;
    const liveOmit = false;
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
      },
    };
    const formData = { foo: 'foo', baz: 'baz' };
    const { node, onChange } = createFormComponent({
      schema,
      formData,
      omitExtraData,
      liveOmit,
    });

    Simulate.change(node.querySelector('#root_foo'), {
      target: { value: 'foobar' },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { foo: 'foobar', baz: 'baz' },
      })
    );
  });

  it('should not omit data on change with omitExtraData=true and liveOmit=false', () => {
    const omitExtraData = true;
    const liveOmit = false;
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
      },
    };
    const formData = { foo: 'foo', baz: 'baz' };
    const { node, onChange } = createFormComponent({
      schema,
      formData,
      omitExtraData,
      liveOmit,
    });

    Simulate.change(node.querySelector('#root_foo'), {
      target: { value: 'foobar' },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { foo: 'foobar', baz: 'baz' },
      })
    );
  });

  it('should not omit data on change with omitExtraData=false and liveOmit=true', () => {
    const omitExtraData = false;
    const liveOmit = true;
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
      },
    };
    const formData = { foo: 'foo', baz: 'baz' };
    const { node, onChange } = createFormComponent({
      schema,
      formData,
      omitExtraData,
      liveOmit,
    });

    Simulate.change(node.querySelector('#root_foo'), {
      target: { value: 'foobar' },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { foo: 'foobar', baz: 'baz' },
      })
    );
  });

  it('should omit data on change with omitExtraData=true and liveOmit=true', () => {
    const omitExtraData = true;
    const liveOmit = true;
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
      },
    };
    const formData = { foo: 'foo', baz: 'baz' };
    const { node, onChange } = createFormComponent({
      schema,
      formData,
      omitExtraData,
      liveOmit,
    });

    Simulate.change(node.querySelector('#root_foo'), {
      target: { value: 'foobar' },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { foo: 'foobar' },
      })
    );
  });

  describe('Async errors', () => {
    it('should render the async errors', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          candy: {
            type: 'object',
            properties: {
              bar: { type: 'string' },
            },
          },
        },
      };

      const extraErrors = {
        foo: {
          __errors: ['some error that got added as a prop'],
        },
        candy: {
          bar: {
            __errors: ['some other error that got added as a prop'],
          },
        },
      };

      const { node } = createFormComponent({ schema, extraErrors });

      expect(node.querySelectorAll('.error-detail li')).toHaveLength(2);
    });

    it('should not block form submission', () => {
      const onSubmit = jest.fn();
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
      };

      const extraErrors = {
        foo: {
          __errors: ['some error that got added as a prop'],
        },
      };

      const { node } = createFormComponent({ schema, extraErrors, onSubmit });
      Simulate.submit(node);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
