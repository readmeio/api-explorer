/* eslint-disable react/no-find-dom-node */
/* eslint-disable max-classes-per-file */
import React from 'react';
import { renderIntoDocument, Simulate } from 'react-dom/test-utils';
import { findDOMNode } from 'react-dom';
import { Portal } from 'react-portal';
import { createRef } from 'create-react-ref';

import Form from '../src';
import { createComponent, createFormComponent, setProps, submitForm } from './test_utils';

let createFormComponentFn;

beforeAll(() => {
  createFormComponentFn = props => createFormComponent({ ...props });
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

  it("should render an UnsupportedField error if schema isn't object", () => {
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
        edit: true,
        uiSchema: {},
        idSchema: { $id: 'root', count: { $id: 'root_count' } },
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
    const { id, classNames, label, help, rawHelp, required, description, rawDescription, children } = props;
    return (
      <div className={`my-template ${classNames}`}>
        <label htmlFor={id}>
          {label}
          {required ? '*' : null}
        </label>
        {description}
        {children}
        {help}
        <span className="raw-help">{`${rawHelp} rendered from the raw format`}</span>
        <span className="raw-description">{`${rawDescription} rendered from the raw format`}</span>
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
        edit: true,
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
