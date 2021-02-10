/* eslint-disable global-require */
import React from 'react';
import { Simulate } from 'react-dom/test-utils';

import validateFormData, { isValid, toErrorList } from '../src/validate';
import { createFormComponent, submitForm } from './test_utils';

describe('Validation', () => {
  describe('validate.isValid()', () => {
    it('should return true if the data is valid against the schema', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
      };

      expect(isValid(schema, { foo: 'bar' })).toBe(true);
    });

    it('should return false if the data is not valid against the schema', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
      };

      expect(isValid(schema, { foo: 12345 })).toBe(false);
    });

    it('should return false if the schema is invalid', () => {
      const schema = 'foobarbaz';

      expect(isValid(schema, { foo: 'bar' })).toBe(false);
    });
  });

  describe('validate.validateFormData()', () => {
    describe('No custom validate function', () => {
      const illFormedKey = 'bar.\'"[]()=+*&^%$#@!';
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          [illFormedKey]: { type: 'string' },
        },
      };

      let errors;
      let errorSchema;

      beforeEach(() => {
        const result = validateFormData({ foo: 42, [illFormedKey]: 41 }, schema);
        errors = result.errors;
        errorSchema = result.errorSchema;
      });

      it('should return an error list', () => {
        expect(errors).toHaveLength(2);
        expect(errors[0].message).toBe('should be string');
        expect(errors[1].message).toBe('should be string');
      });

      it('should return an errorSchema', () => {
        expect(errorSchema.foo.__errors).toHaveLength(1);
        expect(errorSchema.foo.__errors[0]).toBe('should be string');
        expect(errorSchema[illFormedKey].__errors).toHaveLength(1);
        expect(errorSchema[illFormedKey].__errors[0]).toBe('should be string');
      });
    });

    describe('Validating multipleOf with a float', () => {
      const schema = {
        type: 'object',
        properties: {
          price: {
            title: 'Price per task ($)',
            type: 'number',
            multipleOf: 0.01,
            minimum: 0,
          },
        },
      };

      let errors;

      beforeEach(() => {
        const result = validateFormData({ price: 0.14 }, schema);
        errors = result.errors;
      });

      it('should not return an error', () => {
        expect(errors).toHaveLength(0);
      });
    });

    describe('validating using custom meta schema', () => {
      const schema = {
        $ref: '#/definitions/Dataset',
        $schema: 'http://json-schema.org/draft-04/schema#',
        definitions: {
          Dataset: {
            properties: {
              datasetId: {
                pattern: '\\d+',
                type: 'string',
              },
            },
            required: ['datasetId'],
            type: 'object',
          },
        },
      };
      const metaSchemaDraft4 = require('ajv/lib/refs/json-schema-draft-04.json');
      const metaSchemaDraft6 = require('ajv/lib/refs/json-schema-draft-06.json');

      it('should return a validation error about meta schema when meta schema is not defined', () => {
        const errors = validateFormData({ datasetId: 'some kind of text' }, schema);
        const errMessage = 'no schema with key or ref "http://json-schema.org/draft-04/schema#"';
        expect(errors.errors[0].stack).toBe(errMessage);
        expect(errors.errors).toStrictEqual([
          {
            stack: errMessage,
          },
        ]);
        expect(errors.errorSchema).toStrictEqual({
          $schema: { __errors: [errMessage] },
        });
      });

      it('should return a validation error about formData', () => {
        const errors = validateFormData({ datasetId: 'some kind of text' }, schema, null, null, [metaSchemaDraft4]);
        expect(errors.errors).toHaveLength(1);
        expect(errors.errors[0].stack).toBe('.datasetId should match pattern "\\d+"');
      });

      it('should return a validation error about formData, when used with multiple meta schemas', () => {
        const errors = validateFormData({ datasetId: 'some kind of text' }, schema, null, null, [
          metaSchemaDraft4,
          metaSchemaDraft6,
        ]);
        expect(errors.errors).toHaveLength(1);
        expect(errors.errors[0].stack).toBe('.datasetId should match pattern "\\d+"');
      });
    });

    describe('validating using custom string formats', () => {
      const schema = {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            format: 'phone-us',
          },
        },
      };

      it('should not return a validation error if unknown string format is used', () => {
        const result = validateFormData({ phone: '800.555.2368' }, schema);
        expect(result.errors).toHaveLength(0);
      });

      it('should return a validation error about formData', () => {
        const result = validateFormData({ phone: '800.555.2368' }, schema, null, null, null, {
          'phone-us': /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
        });

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].stack).toBe('.phone should match format "phone-us"');
      });

      it('prop updates with new custom formats are accepted', () => {
        const result = validateFormData(
          { phone: 'abc' },
          {
            type: 'object',
            properties: {
              phone: {
                type: 'string',
                format: 'area-code',
              },
            },
          },
          null,
          null,
          null,
          { 'area-code': /\d{3}/ }
        );

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].stack).toBe('.phone should match format "area-code"');
      });
    });

    describe('Custom validate function', () => {
      let errors;
      let errorSchema;

      const schema = {
        type: 'object',
        required: ['pass1', 'pass2'],
        properties: {
          pass1: { type: 'string' },
          pass2: { type: 'string' },
        },
      };

      beforeEach(() => {
        const validate = (formData, errors) => {
          if (formData.pass1 !== formData.pass2) {
            errors.pass2.addError("passwords don't match.");
          }
          return errors;
        };
        const formData = { pass1: 'a', pass2: 'b' };
        const result = validateFormData(formData, schema, validate);
        errors = result.errors;
        errorSchema = result.errorSchema;
      });

      it('should return an error list', () => {
        expect(errors).toHaveLength(1);
        expect(errors[0].stack).toBe("pass2: passwords don't match.");
      });

      it('should return an errorSchema', () => {
        expect(errorSchema.pass2.__errors).toHaveLength(1);
        expect(errorSchema.pass2.__errors[0]).toBe("passwords don't match.");
      });
    });

    describe('Data-Url validation', () => {
      const schema = {
        type: 'object',
        properties: {
          dataUrlWithName: { type: 'string', format: 'data-url' },
          dataUrlWithoutName: { type: 'string', format: 'data-url' },
        },
      };

      it('Data-Url with name is accepted', () => {
        const formData = {
          dataUrlWithName: 'data:text/plain;name=file1.txt;base64,x=',
        };
        const result = validateFormData(formData, schema);
        expect(result.errors).toHaveLength(0);
      });

      it('Data-Url without name is accepted', () => {
        const formData = {
          dataUrlWithoutName: 'data:text/plain;base64,x=',
        };
        const result = validateFormData(formData, schema);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Invalid schema', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            required: 'invalid_type_non_array',
          },
        },
      };

      let errors;
      let errorSchema;

      beforeEach(() => {
        const result = validateFormData({ foo: 42 }, schema);
        errors = result.errors;
        errorSchema = result.errorSchema;
      });

      it('should return an error list', () => {
        expect(errors).toHaveLength(1);
        expect(errors[0].name).toBe('type');
        expect(errors[0].property).toBe(".properties['foo'].required");
        expect(errors[0].schemaPath).toBe('#/definitions/stringArray/type'); // TODO: This schema path is wrong due to a bug in ajv; change this test when https://github.com/epoberezkin/ajv/issues/512 is fixed.
        expect(errors[0].message).toBe('should be array');
      });

      it('should return an errorSchema', () => {
        expect(errorSchema.properties.foo.required.__errors).toHaveLength(1);
        expect(errorSchema.properties.foo.required.__errors[0]).toBe('should be array');
      });
    });
  });

  describe('toErrorList()', () => {
    it('should convert an errorSchema into a flat list', () => {
      expect(
        toErrorList({
          __errors: ['err1', 'err2'],
          a: {
            b: {
              __errors: ['err3', 'err4'],
            },
          },
          c: {
            __errors: ['err5'],
          },
        })
      ).toStrictEqual([
        { stack: 'root: err1' },
        { stack: 'root: err2' },
        { stack: 'b: err3' },
        { stack: 'b: err4' },
        { stack: 'c: err5' },
      ]);
    });
  });

  describe('transformErrors', () => {
    const illFormedKey = 'bar.\'"[]()=+*&^%$#@!';
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        [illFormedKey]: { type: 'string' },
      },
    };
    const newErrorMessage = 'Better error message';
    const transformErrors = errors => {
      return [{ ...errors[0], message: newErrorMessage }];
    };

    let errors;

    beforeEach(() => {
      const result = validateFormData({ foo: 42, [illFormedKey]: 41 }, schema, undefined, transformErrors);
      errors = result.errors;
    });

    it('should use transformErrors function', () => {
      expect(errors).not.toHaveLength(0);
      expect(errors[0].message).toBe(newErrorMessage);
    });
  });

  describe('Form integration', () => {
    describe('JSONSchema validation', () => {
      describe('Required fields', () => {
        const schema = {
          type: 'object',
          required: ['foo'],
          properties: {
            foo: { type: 'string' },
            bar: { type: 'string' },
          },
        };

        let onError;
        let node;

        beforeEach(() => {
          const compInfo = createFormComponent({
            schema,
            formData: {
              foo: undefined,
            },
          });
          onError = compInfo.onError;
          node = compInfo.node;
          submitForm(node);
        });

        it('should trigger onError call', () => {
          expect(onError).toHaveBeenLastCalledWith(
            expect.arrayContaining([
              {
                message: 'is a required property',
                name: 'required',
                params: { missingProperty: 'foo' },
                property: '.foo',
                schemaPath: '#/required',
                stack: '.foo is a required property',
              },
            ])
          );
        });

        it('should render errors', () => {
          expect(node.querySelectorAll('.errors li')).toHaveLength(1);
          expect(node.querySelector('.errors li')).toHaveTextContent('.foo is a required property');
        });
      });

      describe('Min length', () => {
        const schema = {
          type: 'object',
          required: ['foo'],
          properties: {
            foo: {
              type: 'string',
              minLength: 10,
            },
          },
        };

        let node;
        let onError;

        beforeEach(() => {
          onError = jest.fn();
          const compInfo = createFormComponent({
            schema,
            formData: {
              foo: '123456789',
            },
            onError,
          });
          node = compInfo.node;

          submitForm(node);
        });

        it('should render errors', () => {
          expect(node.querySelectorAll('.errors li')).toHaveLength(1);
          expect(node.querySelector('.errors li')).toHaveTextContent('.foo should NOT be shorter than 10 characters');
        });

        it('should trigger the onError handler', () => {
          expect(onError).toHaveBeenLastCalledWith(
            expect.arrayContaining([
              {
                message: 'should NOT be shorter than 10 characters',
                name: 'minLength',
                params: { limit: 10 },
                property: '.foo',
                schemaPath: '#/properties/foo/minLength',
                stack: '.foo should NOT be shorter than 10 characters',
              },
            ])
          );
        });
      });
    });

    describe('Custom Form validation', () => {
      it('should validate a simple string value', () => {
        const schema = { type: 'string' };
        const formData = 'a';

        function validate(formData, errors) {
          if (formData !== 'hello') {
            errors.addError('Invalid');
          }
          return errors;
        }

        const { onError, node } = createFormComponent({
          schema,
          validate,
          formData,
        });

        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(expect.arrayContaining([{ stack: 'root: Invalid' }]));
      });

      it('should live validate a simple string value when liveValidate is set to true', () => {
        const schema = { type: 'string' };
        const formData = 'a';

        function validate(formData, errors) {
          if (formData !== 'hello') {
            errors.addError('Invalid');
          }
          return errors;
        }

        const { onChange, node } = createFormComponent({
          schema,
          validate,
          formData,
          liveValidate: true,
        });
        Simulate.change(node.querySelector('input'), {
          target: { value: '1234' },
        });

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            errorSchema: { __errors: ['Invalid'] },
            errors: [{ stack: 'root: Invalid' }],
            formData: '1234',
          })
        );
      });

      it('should submit form on valid data', () => {
        const schema = { type: 'string' };
        const formData = 'hello';
        const onSubmit = jest.fn();

        function validate(formData, errors) {
          if (formData !== 'hello') {
            errors.addError('Invalid');
          }
          return errors;
        }

        const { node } = createFormComponent({
          schema,
          formData,
          validate,
          onSubmit,
        });

        submitForm(node);

        expect(onSubmit).toHaveBeenCalled();
      });

      it('should prevent form submission on invalid data', () => {
        const schema = { type: 'string' };
        const formData = 'a';
        const onSubmit = jest.fn();
        const onError = jest.fn();

        function validate(formData, errors) {
          if (formData !== 'hello') {
            errors.addError('Invalid');
          }
          return errors;
        }

        const { node } = createFormComponent({
          schema,
          formData,
          validate,
          onSubmit,
          onError,
        });

        submitForm(node);

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalled();
      });

      it('should validate a simple object', () => {
        const schema = {
          type: 'object',
          properties: {
            pass1: { type: 'string', minLength: 3 },
            pass2: { type: 'string', minLength: 3 },
          },
        };

        const formData = { pass1: 'aaa', pass2: 'b' };

        function validate(formData, errors) {
          const { pass1, pass2 } = formData;
          if (pass1 !== pass2) {
            errors.pass2.addError("Passwords don't match");
          }
          return errors;
        }

        const { node, onError } = createFormComponent({
          schema,
          validate,
          formData,
        });
        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            { stack: 'pass2: should NOT be shorter than 3 characters' },
            { stack: "pass2: Passwords don't match" },
          ])
        );
      });

      it('should validate an array of object', () => {
        const schema = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              pass1: { type: 'string' },
              pass2: { type: 'string' },
            },
          },
        };

        const formData = [
          { pass1: 'a', pass2: 'b' },
          { pass1: 'a', pass2: 'a' },
        ];

        function validate(formData, errors) {
          formData.forEach(({ pass1, pass2 }, i) => {
            if (pass1 !== pass2) {
              errors[i].pass2.addError("Passwords don't match");
            }
          });
          return errors;
        }

        const { node, onError } = createFormComponent({
          schema,
          validate,
          formData,
        });

        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(expect.arrayContaining([{ stack: "pass2: Passwords don't match" }]));
      });

      it('should validate a simple array', () => {
        const schema = {
          type: 'array',
          items: {
            type: 'string',
          },
        };

        const formData = ['aaa', 'bbb', 'ccc'];

        function validate(formData, errors) {
          if (formData.indexOf('bbb') !== -1) {
            errors.addError('Forbidden value: bbb');
          }
          return errors;
        }

        const { node, onError } = createFormComponent({
          schema,
          validate,
          formData,
        });
        submitForm(node);
        expect(onError).toHaveBeenLastCalledWith(expect.arrayContaining([{ stack: 'root: Forbidden value: bbb' }]));
      });
    });

    describe('showErrorList prop validation', () => {
      describe('Required fields', () => {
        const schema = {
          type: 'object',
          required: ['foo'],
          properties: {
            foo: { type: 'string' },
            bar: { type: 'string' },
          },
        };

        let node;
        let onError;

        beforeEach(() => {
          const compInfo = createFormComponent({
            schema,
            formData: {
              foo: undefined,
            },
            showErrorList: false,
          });
          node = compInfo.node;
          onError = compInfo.onError;

          submitForm(node);
        });

        it('should not render error list if showErrorList prop true', () => {
          expect(node.querySelectorAll('.errors li')).toHaveLength(0);
        });

        it('should trigger onError call', () => {
          expect(onError).toHaveBeenLastCalledWith(
            expect.arrayContaining([
              {
                message: 'is a required property',
                name: 'required',
                params: { missingProperty: 'foo' },
                property: '.foo',
                schemaPath: '#/required',
                stack: '.foo is a required property',
              },
            ])
          );
        });
      });
    });

    describe('Custom ErrorList', () => {
      const schema = {
        type: 'string',
        minLength: 1,
      };

      const uiSchema = {
        foo: 'bar',
      };

      const formData = 0;

      const CustomErrorList = ({ errors, errorSchema, schema, uiSchema, formContext: { className } }) => (
        <div>
          <div className="CustomErrorList">{errors.length} custom</div>
          <div className={'ErrorSchema'}>{errorSchema.__errors[0]}</div>
          <div className={'Schema'}>{schema.type}</div>
          <div className={'UiSchema'}>{uiSchema.foo}</div>
          <div className={className} />
        </div>
      );

      it('should use CustomErrorList', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          liveValidate: true,
          formData,
          ErrorList: CustomErrorList,
          formContext: { className: 'foo' },
        });
        expect(node.querySelectorAll('.CustomErrorList')).toHaveLength(1);
        expect(node.querySelector('.CustomErrorList')).toHaveTextContent('1 custom');
        expect(node.querySelectorAll('.ErrorSchema')).toHaveLength(1);
        expect(node.querySelector('.ErrorSchema')).toHaveTextContent('should be string');
        expect(node.querySelectorAll('.Schema')).toHaveLength(1);
        expect(node.querySelector('.Schema')).toHaveTextContent('string');
        expect(node.querySelectorAll('.UiSchema')).toHaveLength(1);
        expect(node.querySelector('.UiSchema')).toHaveTextContent('bar');
        expect(node.querySelectorAll('.foo')).toHaveLength(1);
      });
    });

    describe('Custom meta schema', () => {
      let onError;
      let node;
      const formData = {
        datasetId: 'no err',
      };

      const schema = {
        $ref: '#/definitions/Dataset',
        $schema: 'http://json-schema.org/draft-04/schema#',
        definitions: {
          Dataset: {
            properties: {
              datasetId: {
                pattern: '\\d+',
                type: 'string',
              },
            },
            required: ['datasetId'],
            type: 'object',
          },
        },
      };

      beforeEach(() => {
        const withMetaSchema = createFormComponent({
          schema,
          formData,
          liveValidate: true,
          additionalMetaSchemas: [require('ajv/lib/refs/json-schema-draft-04.json')],
        });
        node = withMetaSchema.node;
        onError = withMetaSchema.onError;
        submitForm(node);
      });

      it('should be used to validate schema', () => {
        expect(node.querySelectorAll('.errors li')).toHaveLength(1);
        expect(onError).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            {
              message: 'should match pattern "\\d+"',
              name: 'pattern',
              params: { pattern: '\\d+' },
              property: '.datasetId',
              schemaPath: '#/properties/datasetId/pattern',
              stack: '.datasetId should match pattern "\\d+"',
            },
          ])
        );
        onError.mockClear();

        Simulate.change(node.querySelector('input'), {
          target: { value: '1234' },
        });
        expect(node.querySelectorAll('.errors li')).toHaveLength(0);
        expect(onError).not.toHaveBeenCalled();
      });
    });
  });
});
