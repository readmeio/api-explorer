import React from 'react';

import {
  ADDITIONAL_PROPERTY_FLAG,
  asNumber,
  dataURItoBlob,
  deepEquals,
  getDefaultFormState,
  getSchemaType,
  getWidget,
  isFilesArray,
  isConstant,
  toConstant,
  isMultiSelect,
  mergeDefaultsWithFormData,
  mergeObjects,
  pad,
  isCyclic,
  parseDateString,
  retrieveSchema,
  shouldRender,
  toDateString,
  toIdSchema,
  guessType,
  mergeSchemas,
} from '../src/utils';

describe('utils', () => {
  describe('getDefaultFormState()', () => {
    describe('root default', () => {
      it('should map root schema default to form state, if any', () => {
        expect(
          getDefaultFormState({
            type: 'string',
            default: 'foo',
          })
        ).toBe('foo');
      });

      it('should keep existing form data that is equal to 0', () => {
        expect(
          getDefaultFormState(
            {
              type: 'number',
              default: 1,
            },
            0
          )
        ).toBe(0);
      });

      it('should keep existing form data that is equal to false', () => {
        expect(
          getDefaultFormState(
            {
              type: 'boolean',
            },
            false
          )
        ).toBe(false);
      });

      const noneValues = [null, undefined, NaN];
      noneValues.forEach(noneValue => {
        it('should overwrite existing form data that is equal to a none value', () => {
          expect(
            getDefaultFormState(
              {
                type: 'number',
                default: 1,
              },
              noneValue
            )
          ).toBe(1);
        });
      });
    });

    describe('nested default', () => {
      it('should map schema object prop default to form state', () => {
        expect(
          getDefaultFormState({
            type: 'object',
            properties: {
              string: {
                type: 'string',
                default: 'foo',
              },
            },
          })
        ).toStrictEqual({ string: 'foo' });
      });

      it('should default to empty object if no properties are defined', () => {
        expect(
          getDefaultFormState({
            type: 'object',
          })
        ).toStrictEqual({});
      });

      it('should recursively map schema object default to form state', () => {
        expect(
          getDefaultFormState({
            type: 'object',
            properties: {
              object: {
                type: 'object',
                properties: {
                  string: {
                    type: 'string',
                    default: 'foo',
                  },
                },
              },
            },
          })
        ).toStrictEqual({ object: { string: 'foo' } });
      });

      it('should map schema array default to form state', () => {
        expect(
          getDefaultFormState({
            type: 'object',
            properties: {
              array: {
                type: 'array',
                default: ['foo', 'bar'],
                items: {
                  type: 'string',
                },
              },
            },
          })
        ).toStrictEqual({ array: ['foo', 'bar'] });
      });

      it('should recursively map schema array default to form state', () => {
        expect(
          getDefaultFormState({
            type: 'object',
            properties: {
              object: {
                type: 'object',
                properties: {
                  array: {
                    type: 'array',
                    default: ['foo', 'bar'],
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          })
        ).toStrictEqual({ object: { array: ['foo', 'bar'] } });
      });

      it('should propagate nested defaults to resulting formData by default', () => {
        const schema = {
          type: 'object',
          properties: {
            object: {
              type: 'object',
              properties: {
                array: {
                  type: 'array',
                  default: ['foo', 'bar'],
                  items: {
                    type: 'string',
                  },
                },
                bool: {
                  type: 'boolean',
                  default: true,
                },
              },
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          object: { array: ['foo', 'bar'], bool: true },
        });
      });

      it("should keep parent defaults if they don't have a node level default", () => {
        const schema = {
          type: 'object',
          properties: {
            level1: {
              type: 'object',
              default: {
                level2: {
                  leaf1: 1,
                  leaf2: 1,
                  leaf3: 1,
                  leaf4: 1,
                },
              },
              properties: {
                level2: {
                  type: 'object',
                  default: {
                    // No level2 default for leaf1
                    leaf2: 2,
                    leaf3: 2,
                  },
                  properties: {
                    leaf1: { type: 'number' }, // No level2 default for leaf1
                    leaf2: { type: 'number' }, // No level3 default for leaf2
                    leaf3: { type: 'number', default: 3 },
                    leaf4: { type: 'number' }, // Defined in formData.
                  },
                },
              },
            },
          },
        };
        expect(
          getDefaultFormState(schema, {
            level1: { level2: { leaf4: 4 } },
          })
        ).toStrictEqual({
          level1: {
            level2: { leaf1: 1, leaf2: 2, leaf3: 3, leaf4: 4 },
          },
        });
      });

      it('should support nested values in formData', () => {
        const schema = {
          type: 'object',
          properties: {
            level1: {
              type: 'object',
              properties: {
                level2: {
                  oneOf: [
                    {
                      type: 'object',
                      properties: {
                        leaf1: {
                          type: 'string',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        };
        const formData = {
          level1: {
            level2: {
              leaf1: 'a',
            },
          },
        };
        expect(getDefaultFormState(schema, formData)).toStrictEqual({
          level1: { level2: { leaf1: 'a' } },
        });
      });

      it('should use parent defaults for ArrayFields', () => {
        const schema = {
          type: 'object',
          properties: {
            level1: {
              type: 'array',
              default: [1, 2, 3],
              items: { type: 'number' },
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          level1: [1, 2, 3],
        });
      });

      it('should use parent defaults for ArrayFields if declared in parent', () => {
        const schema = {
          type: 'object',
          default: { level1: [1, 2, 3] },
          properties: {
            level1: {
              type: 'array',
              items: { type: 'number' },
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          level1: [1, 2, 3],
        });
      });

      it('should map item defaults to fixed array default', () => {
        const schema = {
          type: 'object',
          properties: {
            array: {
              type: 'array',
              items: [
                {
                  type: 'string',
                  default: 'foo',
                },
                {
                  type: 'number',
                },
              ],
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          array: ['foo', undefined],
        });
      });

      it('should merge schema array item defaults from grandparent for overlapping default definitions', () => {
        const schema = {
          type: 'object',
          default: {
            level1: { level2: ['root-default-1', 'root-default-2'] },
          },
          properties: {
            level1: {
              type: 'object',
              properties: {
                level2: {
                  type: 'array',
                  items: [
                    {
                      type: 'string',
                      default: 'child-default-1',
                    },
                    {
                      type: 'string',
                    },
                  ],
                },
              },
            },
          },
        };

        expect(getDefaultFormState(schema, {})).toStrictEqual({
          level1: { level2: ['child-default-1', 'root-default-2'] },
        });
      });

      it('should overwrite schema array item defaults from parent for nested default definitions', () => {
        const schema = {
          type: 'object',
          default: {
            level1: {
              level2: [{ item: 'root-default-1' }, { item: 'root-default-2' }],
            },
          },
          properties: {
            level1: {
              type: 'object',
              default: { level2: [{ item: 'parent-default-1' }, {}] },
              properties: {
                level2: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      item: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        };

        expect(getDefaultFormState(schema, {})).toStrictEqual({
          level1: { level2: [{ item: 'parent-default-1' }, {}] },
        });
      });

      it('should merge schema array item defaults from the same item for overlapping default definitions', () => {
        const schema = {
          type: 'object',
          properties: {
            level1: {
              type: 'array',
              default: ['property-default-1', 'property-default-2'],
              items: [
                {
                  type: 'string',
                  default: 'child-default-1',
                },
                {
                  type: 'string',
                },
              ],
            },
          },
        };

        expect(getDefaultFormState(schema, {})).toStrictEqual({
          level1: ['child-default-1', 'property-default-2'],
        });
      });

      it('should merge schema from additionalItems defaults into property default', () => {
        const schema = {
          type: 'object',
          properties: {
            level1: {
              type: 'array',
              default: [
                {
                  item: 'property-default-1',
                },
                {},
              ],
              additionalItems: {
                type: 'object',
                properties: {
                  item: {
                    type: 'string',
                    default: 'additional-default',
                  },
                },
              },
              items: [
                {
                  type: 'object',
                  properties: {
                    item: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        };

        expect(getDefaultFormState(schema, {})).toStrictEqual({
          level1: [{ item: 'property-default-1' }, { item: 'additional-default' }],
        });
      });

      it('should overwrite defaults over multiple levels with arrays', () => {
        const schema = {
          type: 'object',
          default: {
            level1: [
              {
                item: 'root-default-1',
              },
              {
                item: 'root-default-2',
              },
              {
                item: 'root-default-3',
              },
              {
                item: 'root-default-4',
              },
            ],
          },
          properties: {
            level1: {
              type: 'array',
              default: [
                {
                  item: 'property-default-1',
                },
                {},
                {},
              ],
              additionalItems: {
                type: 'object',
                properties: {
                  item: {
                    type: 'string',
                    default: 'additional-default',
                  },
                },
              },
              items: [
                {
                  type: 'object',
                  properties: {
                    item: {
                      type: 'string',
                    },
                  },
                },
                {
                  type: 'object',
                  properties: {
                    item: {
                      type: 'string',
                      default: 'child-default-2',
                    },
                  },
                },
              ],
            },
          },
        };

        expect(getDefaultFormState(schema, {})).toStrictEqual({
          level1: [{ item: 'property-default-1' }, { item: 'child-default-2' }, { item: 'additional-default' }],
        });
      });

      it('should use schema default for referenced definitions', () => {
        const schema = {
          definitions: {
            testdef: {
              type: 'object',
              properties: {
                foo: { type: 'number' },
              },
            },
          },
          $ref: '#/definitions/testdef',
          default: { foo: 42 },
        };

        expect(getDefaultFormState(schema, undefined, schema)).toStrictEqual({
          foo: 42,
        });
      });

      it('should fill array with additional items schema when items is empty', () => {
        const schema = {
          type: 'object',
          properties: {
            array: {
              type: 'array',
              minItems: 1,
              additionalItems: {
                type: 'string',
                default: 'foo',
              },
              items: [],
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          array: ['foo'],
        });
      });

      it('should not fill array with additional items from schema when items is empty and form data contains partial array', () => {
        const schema = {
          type: 'object',
          properties: {
            array: {
              type: 'array',
              minItems: 2,
              additionalItems: {
                type: 'string',
                default: 'foo',
              },
              items: [],
            },
          },
        };
        expect(getDefaultFormState(schema, { array: ['bar'] })).toStrictEqual({
          array: ['bar'],
        });
      });

      it('should fill defaults in existing array items', () => {
        const schema = {
          type: 'array',
          minItems: 2,
          items: {
            type: 'object',
            properties: {
              item: {
                type: 'string',
                default: 'foo',
              },
            },
          },
        };
        expect(getDefaultFormState(schema, [{}])).toStrictEqual([{ item: 'foo' }]);
      });

      it('defaults passed along for multiselect arrays when minItems is present', () => {
        const schema = {
          type: 'object',
          properties: {
            array: {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              default: ['foo', 'qux'],
              items: {
                type: 'string',
                enum: ['foo', 'bar', 'fuzz', 'qux'],
              },
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          array: ['foo', 'qux'],
        });
      });
    });

    describe('defaults with oneOf', () => {
      it('should populate defaults for oneOf', () => {
        const schema = {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              oneOf: [
                { type: 'string', default: 'a' },
                { type: 'string', default: 'b' },
              ],
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          name: 'a',
        });
      });

      it("should populate defaults for oneOf when 'type': 'object' is missing", () => {
        const schema = {
          type: 'object',
          oneOf: [
            {
              properties: { name: { type: 'string', default: 'a' } },
            },
            {
              properties: { id: { type: 'number', default: 13 } },
            },
          ],
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          name: 'a',
        });
      });

      it('should populate nested default values for oneOf', () => {
        const schema = {
          type: 'object',
          properties: {
            name: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    first: { type: 'string', default: 'First Name' },
                  },
                },
                { type: 'string', default: 'b' },
              ],
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          name: {
            first: 'First Name',
          },
        });
      });
    });

    describe('defaults with anyOf', () => {
      it('should populate defaults for anyOf', () => {
        const schema = {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              anyOf: [
                { type: 'string', default: 'a' },
                { type: 'string', default: 'b' },
              ],
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          name: 'a',
        });
      });

      it('should populate nested default values for anyOf', () => {
        const schema = {
          type: 'object',
          properties: {
            name: {
              type: 'object',
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    first: { type: 'string', default: 'First Name' },
                  },
                },
                { type: 'string', default: 'b' },
              ],
            },
          },
        };
        expect(getDefaultFormState(schema, {})).toStrictEqual({
          name: {
            first: 'First Name',
          },
        });
      });
    });

    describe('with schema keys not defined in the formData', () => {
      it("shouldn't add in undefined keys to formData", () => {
        const schema = {
          type: 'object',
          properties: {
            foo: { type: 'string' },
            bar: { type: 'string' },
          },
        };
        const formData = {
          foo: 'foo',
          baz: 'baz',
        };
        const result = {
          foo: 'foo',
          baz: 'baz',
        };
        expect(getDefaultFormState(schema, formData)).toStrictEqual(result);
      });
    });
  });

  describe('asNumber()', () => {
    it('should return a number out of a string representing a number', () => {
      expect(asNumber('3')).toBe(3);
    });

    it('should return a float out of a string representing a float', () => {
      expect(asNumber('3.14')).toBe(3.14);
    });

    it('should return the raw value if the input ends with a dot', () => {
      expect(asNumber('3.')).toBe('3.');
    });

    it('should not convert the value to an integer if the input ends with a 0', () => {
      // this is to allow users to input 3.07
      expect(asNumber('3.0')).toBe('3.0');
    });

    it('should allow numbers with a 0 in the first decimal place', () => {
      expect(asNumber('3.07')).toBe(3.07);
    });

    it('should return undefined if the input is empty', () => {
      expect(asNumber('')).toBeUndefined();
    });

    it('should return null if the input is null', () => {
      expect(asNumber(null)).toBeNull();
    });
  });

  describe('isConstant', () => {
    it('should return false when neither enum nor const is defined', () => {
      const schema = {};
      expect(isConstant(schema)).toBe(false);
    });

    it('should return true when schema enum is an array of one item', () => {
      const schema = { enum: ['foo'] };
      expect(isConstant(schema)).toBe(true);
    });

    it('should return false when schema enum contains several items', () => {
      const schema = { enum: ['foo', 'bar', 'baz'] };
      expect(isConstant(schema)).toBe(false);
    });

    it('should return true when schema const is defined', () => {
      const schema = { const: 'foo' };
      expect(isConstant(schema)).toBe(true);
    });
  });

  describe('toConstant()', () => {
    describe('schema contains an enum array', () => {
      it('should return its first value when it contains a unique element', () => {
        const schema = { enum: ['foo'] };
        expect(toConstant(schema)).toBe('foo');
      });

      it('should return schema const value when it exists', () => {
        const schema = { const: 'bar' };
        expect(toConstant(schema)).toBe('bar');
      });

      it('should throw when it contains more than one element', () => {
        const schema = { enum: ['foo', 'bar'] };
        expect(() => {
          toConstant(schema);
        }).toThrow('cannot be inferred');
      });
    });
  });

  describe('isMultiSelect()', () => {
    describe('uniqueItems is true', () => {
      describe('schema items enum is an array', () => {
        it('should be true', () => {
          const schema = {
            items: { enum: ['foo', 'bar'] },
            uniqueItems: true,
          };
          expect(isMultiSelect(schema)).toBe(true);
        });
      });

      it('should be false if items is undefined', () => {
        const schema = {};
        expect(isMultiSelect(schema)).toBe(false);
      });

      describe('schema items enum is not an array', () => {
        const constantSchema = { type: 'string', enum: ['Foo'] };
        const notConstantSchema = { type: 'string' };

        it('should be false if oneOf/anyOf is not in items schema', () => {
          const schema = { items: {}, uniqueItems: true };
          expect(isMultiSelect(schema)).toBe(false);
        });

        it('should be false if oneOf/anyOf schemas are not all constants', () => {
          const schema = {
            items: { oneOf: [constantSchema, notConstantSchema] },
            uniqueItems: true,
          };
          expect(isMultiSelect(schema)).toBe(false);
        });

        it('should be true if oneOf/anyOf schemas are all constants', () => {
          const schema = {
            items: { oneOf: [constantSchema, constantSchema] },
            uniqueItems: true,
          };
          expect(isMultiSelect(schema)).toBe(true);
        });
      });

      it('should retrieve reference schema definitions', () => {
        const schema = {
          items: { $ref: '#/definitions/FooItem' },
          uniqueItems: true,
        };
        const definitions = {
          FooItem: { type: 'string', enum: ['foo'] },
        };
        expect(isMultiSelect(schema, { definitions })).toBe(true);
      });
    });

    it('should be false if uniqueItems is false', () => {
      const schema = {
        items: { enum: ['foo', 'bar'] },
        uniqueItems: false,
      };
      expect(isMultiSelect(schema)).toBe(false);
    });
  });

  describe('isFilesArray()', () => {
    it('should be true if items have data-url format', () => {
      const schema = { items: { type: 'string', format: 'data-url' } };
      const uiSchema = {};
      expect(isFilesArray(schema, uiSchema)).toBe(true);
    });

    it('should be false if items is undefined', () => {
      const schema = {};
      const uiSchema = {};
      expect(isFilesArray(schema, uiSchema)).toBe(false);
    });
  });

  describe('mergeDefaultsWithFormData()', () => {
    it("shouldn't mutate the provided objects", () => {
      const obj1 = { a: 1 };
      mergeDefaultsWithFormData(obj1, { b: 2 });
      expect(obj1).toStrictEqual({ a: 1 });
    });

    it("shouldn't mutate the provided arrays", () => {
      const array1 = [1];
      mergeDefaultsWithFormData(array1, [2]);
      expect(array1).toStrictEqual([1]);
    });

    it('should merge two one-level deep objects', () => {
      expect(mergeDefaultsWithFormData({ a: 1 }, { b: 2 })).toStrictEqual({ a: 1, b: 2 });
    });

    it('should override the first object with the values from the second', () => {
      expect(mergeDefaultsWithFormData({ a: 1 }, { a: 2 })).toStrictEqual({ a: 2 });
    });

    it('should override non-existing values of the first object with the values from the second', () => {
      expect(mergeDefaultsWithFormData({ a: { b: undefined } }, { a: { b: { c: 1 } } })).toStrictEqual({
        a: { b: { c: 1 } },
      });
    });

    it('should merge arrays using entries from second', () => {
      expect(mergeDefaultsWithFormData([1, 2, 3], [4, 5])).toStrictEqual([4, 5]);
    });

    it('should deeply merge arrays with overlapping entries', () => {
      expect(mergeDefaultsWithFormData([{ a: 1 }], [{ b: 2 }])).toStrictEqual([{ a: 1, b: 2 }]);
    });

    it('should recursively merge deeply nested objects', () => {
      const obj1 = {
        a: 1,
        b: {
          c: 3,
          d: [1, 2, 3],
          e: { f: { g: 1 } },
          h: [{ i: 1 }, { i: 2 }],
        },
        c: 2,
      };
      const obj2 = {
        a: 1,
        b: {
          d: [3],
          e: { f: { h: 2 } },
          g: 1,
          h: [{ i: 3 }],
        },
        c: 3,
      };
      const expected = {
        a: 1,
        b: {
          c: 3,
          d: [3],
          e: { f: { g: 1, h: 2 } },
          g: 1,
          h: [{ i: 3 }],
        },
        c: 3,
      };
      expect(mergeDefaultsWithFormData(obj1, obj2)).toStrictEqual(expected);
    });

    it('should recursively merge File objects', () => {
      const file = new File(['test'], 'test.txt');
      const obj1 = {
        a: {},
      };
      const obj2 = {
        a: file,
      };
      expect(mergeDefaultsWithFormData(obj1, obj2).a).toBeInstanceOf(File);
    });
  });

  describe('mergeObjects()', () => {
    it("shouldn't mutate the provided objects", () => {
      const obj1 = { a: 1 };
      mergeObjects(obj1, { b: 2 });
      expect(obj1).toStrictEqual({ a: 1 });
    });

    it('should merge two one-level deep objects', () => {
      expect(mergeObjects({ a: 1 }, { b: 2 })).toStrictEqual({ a: 1, b: 2 });
    });

    it('should override the first object with the values from the second', () => {
      expect(mergeObjects({ a: 1 }, { a: 2 })).toStrictEqual({ a: 2 });
    });

    it('should override non-existing values of the first object with the values from the second', () => {
      expect(mergeObjects({ a: { b: undefined } }, { a: { b: { c: 1 } } })).toStrictEqual({ a: { b: { c: 1 } } });
    });

    it('should recursively merge deeply nested objects', () => {
      const obj1 = {
        a: 1,
        b: {
          c: 3,
          d: [1, 2, 3],
          e: { f: { g: 1 } },
        },
        c: 2,
      };
      const obj2 = {
        a: 1,
        b: {
          d: [3, 2, 1],
          e: { f: { h: 2 } },
          g: 1,
        },
        c: 3,
      };
      const expected = {
        a: 1,
        b: {
          c: 3,
          d: [3, 2, 1],
          e: { f: { g: 1, h: 2 } },
          g: 1,
        },
        c: 3,
      };
      expect(mergeObjects(obj1, obj2)).toStrictEqual(expected);
    });

    it('should recursively merge File objects', () => {
      const file = new File(['test'], 'test.txt');
      const obj1 = {
        a: {},
      };
      const obj2 = {
        a: file,
      };
      expect(mergeObjects(obj1, obj2).a).toBeInstanceOf(File);
    });

    describe('concatArrays option', () => {
      it('should not concat arrays by default', () => {
        const obj1 = { a: [1] };
        const obj2 = { a: [2] };

        expect(mergeObjects(obj1, obj2)).toStrictEqual({ a: [2] });
      });

      it('should concat arrays when concatArrays is true', () => {
        const obj1 = { a: [1] };
        const obj2 = { a: [2] };

        expect(mergeObjects(obj1, obj2, true)).toStrictEqual({ a: [1, 2] });
      });

      it('should concat nested arrays when concatArrays is true', () => {
        const obj1 = { a: { b: [1] } };
        const obj2 = { a: { b: [2] } };

        expect(mergeObjects(obj1, obj2, true)).toStrictEqual({
          a: { b: [1, 2] },
        });
      });
    });
  });

  describe('mergeSchemas()', () => {
    it("shouldn't mutate the provided objects", () => {
      const obj1 = { a: 1 };
      mergeSchemas(obj1, { b: 2 });
      expect(obj1).toStrictEqual({ a: 1 });
    });

    it('should merge two one-level deep objects', () => {
      expect(mergeSchemas({ a: 1 }, { b: 2 })).toStrictEqual({ a: 1, b: 2 });
    });

    it('should override the first object with the values from the second', () => {
      expect(mergeSchemas({ a: 1 }, { a: 2 })).toStrictEqual({ a: 2 });
    });

    it('should override non-existing values of the first object with the values from the second', () => {
      expect(mergeSchemas({ a: { b: undefined } }, { a: { b: { c: 1 } } })).toStrictEqual({ a: { b: { c: 1 } } });
    });

    it('should recursively merge deeply nested objects', () => {
      const obj1 = {
        a: 1,
        b: {
          c: 3,
          d: [1, 2, 3],
          e: { f: { g: 1 } },
        },
        c: 2,
      };
      const obj2 = {
        a: 1,
        b: {
          d: [3, 2, 1],
          e: { f: { h: 2 } },
          g: 1,
        },
        c: 3,
      };
      const expected = {
        a: 1,
        b: {
          c: 3,
          d: [3, 2, 1],
          e: { f: { g: 1, h: 2 } },
          g: 1,
        },
        c: 3,
      };
      expect(mergeSchemas(obj1, obj2)).toStrictEqual(expected);
    });

    it('should recursively merge File objects', () => {
      const file = new File(['test'], 'test.txt');
      const obj1 = {
        a: {},
      };
      const obj2 = {
        a: file,
      };
      expect(mergeSchemas(obj1, obj2).a).toBeInstanceOf(File);
    });

    describe('arrays', () => {
      it('should not concat arrays', () => {
        const obj1 = { a: [1] };
        const obj2 = { a: [2] };

        expect(mergeSchemas(obj1, obj2)).toStrictEqual({ a: [2] });
      });

      it("should concat arrays under 'required' keyword", () => {
        const obj1 = { type: 'object', required: [1] };
        const obj2 = { type: 'object', required: [2] };

        expect(mergeSchemas(obj1, obj2)).toStrictEqual({
          type: 'object',
          required: [1, 2],
        });
      });

      it("should concat arrays under 'required' keyword when one of the schemas is an object type", () => {
        const obj1 = { type: 'object', required: [1] };
        const obj2 = { required: [2] };

        expect(mergeSchemas(obj1, obj2)).toStrictEqual({
          type: 'object',
          required: [1, 2],
        });
      });

      it("should concat nested arrays under 'required' keyword", () => {
        const obj1 = { a: { type: 'object', required: [1] } };
        const obj2 = { a: { type: 'object', required: [2] } };

        expect(mergeSchemas(obj1, obj2)).toStrictEqual({
          a: { type: 'object', required: [1, 2] },
        });
      });

      it("should not include duplicate values when concatting arrays under 'required' keyword", () => {
        const obj1 = { type: 'object', required: [1] };
        const obj2 = { type: 'object', required: [1] };

        expect(mergeSchemas(obj1, obj2)).toStrictEqual({ type: 'object', required: [1] });
      });

      it("should not concat arrays under 'required' keyword that are not under an object type", () => {
        const obj1 = { required: [1] };
        const obj2 = { required: [2] };

        expect(mergeSchemas(obj1, obj2)).toStrictEqual({ required: [2] });
      });
    });
  });

  describe('retrieveSchema()', () => {
    it("should 'resolve' a schema which contains definitions", () => {
      const schema = { $ref: '#/definitions/address' };
      const address = {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
        },
        required: ['street_address', 'city', 'state'],
      };
      const definitions = { address };

      expect(retrieveSchema(schema, { definitions })).toStrictEqual(address);
    });

    it("should 'resolve' a schema which contains definitions not in `#/definitions`", () => {
      const address = {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
        },
        required: ['street_address', 'city', 'state'],
      };
      const schema = {
        $ref: '#/components/schemas/address',
        components: { schemas: { address } },
      };

      expect(retrieveSchema(schema, schema)).toStrictEqual({
        components: { schemas: { address } },
        ...address,
      });
    });

    it('should give an error when JSON pointer is not in a URI encoded format', () => {
      const address = {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
        },
        required: ['street_address', 'city', 'state'],
      };
      const schema = {
        $ref: '/components/schemas/address',
        components: { schemas: { address } },
      };

      expect(() => retrieveSchema(schema, schema)).toThrow('Could not find a definition');
    });

    it('should give an error when JSON pointer does not point to anything', () => {
      const schema = {
        $ref: '#/components/schemas/address',
        components: { schemas: {} },
      };

      expect(() => retrieveSchema(schema, schema)).toThrow('Could not find a definition');
    });

    it("should 'resolve' escaped JSON Pointers", () => {
      const schema = { $ref: '#/definitions/a~0complex~1name' };
      const address = { type: 'string' };
      const definitions = { 'a~complex/name': address };

      expect(retrieveSchema(schema, { definitions })).toStrictEqual(address);
    });

    it("should 'resolve' and stub out a schema which contains an `additionalProperties` with a definition", () => {
      const schema = {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/components/schemas/address',
        },
      };

      const address = {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
        },
        required: ['street_address', 'city', 'state'],
      };

      const definitions = { components: { schemas: { address } } };
      const formData = { newKey: {} };

      expect(retrieveSchema(schema, { definitions }, formData)).toStrictEqual({
        ...schema,
        properties: {
          newKey: {
            ...address,
            [ADDITIONAL_PROPERTY_FLAG]: true,
          },
        },
      });
    });

    it("should 'resolve' and stub out a schema which contains an `additionalProperties` with a type and definition", () => {
      const schema = {
        type: 'string',
        additionalProperties: {
          $ref: '#/definitions/number',
        },
      };

      const number = {
        type: 'number',
      };

      const definitions = { number };
      const formData = { newKey: {} };

      expect(retrieveSchema(schema, { definitions }, formData)).toStrictEqual({
        ...schema,
        properties: {
          newKey: {
            ...number,
            [ADDITIONAL_PROPERTY_FLAG]: true,
          },
        },
      });
    });

    it('should priorize local definitions over foreign ones', () => {
      const schema = {
        $ref: '#/definitions/address',
        title: 'foo',
      };
      const address = {
        type: 'string',
        title: 'bar',
      };
      const definitions = { address };

      expect(retrieveSchema(schema, { definitions })).toStrictEqual({
        ...address,
        title: 'foo',
      });
    });

    describe('allOf', () => {
      it('should merge types', () => {
        const schema = {
          allOf: [{ type: ['string', 'number', 'null'] }, { type: 'string' }],
        };
        const definitions = {};
        const formData = {};
        expect(retrieveSchema(schema, { definitions }, formData)).toStrictEqual({
          type: 'string',
        });
      });

      it('should not merge incompatible types', () => {
        jest.spyOn(console, 'warn');
        const schema = {
          allOf: [{ type: 'string' }, { type: 'boolean' }],
        };
        const definitions = {};
        const formData = {};
        expect(retrieveSchema(schema, { definitions }, formData)).toStrictEqual({});
        // expect(console.warn.calledWithMatch(/could not merge subschemas in allOf/)).toBe(true);
      });

      it('should merge types with $ref in them', () => {
        const schema = {
          allOf: [{ $ref: '#/definitions/1' }, { $ref: '#/definitions/2' }],
        };
        const definitions = {
          1: { type: 'string' },
          2: { minLength: 5 },
        };
        const formData = {};
        expect(retrieveSchema(schema, { definitions }, formData)).toStrictEqual({
          type: 'string',
          minLength: 5,
        });
      });

      it("should properly merge schemas with nested allOf's", () => {
        const schema = {
          allOf: [
            {
              type: 'string',
              allOf: [{ minLength: 2 }, { maxLength: 5 }],
            },
            {
              type: 'string',
              allOf: [{ default: 'hi' }, { minLength: 4 }],
            },
          ],
        };
        const definitions = {};
        const formData = {};
        expect(retrieveSchema(schema, { definitions }, formData)).toStrictEqual({
          type: 'string',
          minLength: 4,
          maxLength: 5,
          default: 'hi',
        });
      });

      it('should properly merge schemas with a `example` property', () => {
        const schema = {
          allOf: [
            {
              type: 'object',
            },
          ],
          example: {
            tktk: 'tktk',
          },
        };
        const definitions = {};
        const formData = {};
        expect(retrieveSchema(schema, { definitions }, formData)).toStrictEqual({
          example: {
            tktk: 'tktk',
          },
          type: 'object',
        });
      });

      it('should properly merge schemas with a `format` property on an integer or number', () => {
        const schema = {
          allOf: [
            {
              type: 'integer',
              format: 'int32',
            },
            {
              type: 'integer',
            },
          ],
        };
        const definitions = {};
        const formData = {};
        expect(retrieveSchema(schema, { definitions }, formData)).toStrictEqual({
          type: 'integer',
          format: 'int32',
        });
      });
    });
  });

  describe('shouldRender', () => {
    describe('single level comparison checks', () => {
      const initial = { props: { myProp: 1 }, state: { myState: 1 } };

      it('should detect equivalent props and state', () => {
        expect(shouldRender(initial, { myProp: 1 }, { myState: 1 })).toBe(false);
      });

      it('should detect diffing props', () => {
        expect(shouldRender(initial, { myProp: 2 }, { myState: 1 })).toBe(true);
      });

      it('should detect diffing state', () => {
        expect(shouldRender(initial, { myProp: 1 }, { myState: 2 })).toBe(true);
      });

      it('should handle equivalent function prop', () => {
        const fn = () => {};
        expect(shouldRender({ props: { myProp: fn }, state: { myState: 1 } }, { myProp: fn }, { myState: 1 })).toBe(
          false
        );
      });
    });

    describe('nested levels comparison checks', () => {
      const initial = {
        props: { myProp: { mySubProp: 1 } },
        state: { myState: { mySubState: 1 } },
      };

      it('should detect equivalent props and state', () => {
        expect(shouldRender(initial, { myProp: { mySubProp: 1 } }, { myState: { mySubState: 1 } })).toBe(false);
      });

      it('should detect diffing props', () => {
        expect(shouldRender(initial, { myProp: { mySubProp: 2 } }, { myState: { mySubState: 1 } })).toBe(true);
      });

      it('should detect diffing state', () => {
        expect(shouldRender(initial, { myProp: { mySubProp: 1 } }, { myState: { mySubState: 2 } })).toBe(true);
      });

      it('should handle equivalent function prop', () => {
        const fn = () => {};
        expect(
          shouldRender(
            {
              props: { myProp: { mySubProp: fn } },
              state: { myState: { mySubState: fn } },
            },
            { myProp: { mySubProp: fn } },
            { myState: { mySubState: fn } }
          )
        ).toBe(false);
      });
    });
  });

  describe('toIdSchema', () => {
    it('should return an idSchema for root field', () => {
      const schema = { type: 'string' };

      expect(toIdSchema(schema)).toStrictEqual({ $id: 'root' });
    });

    it('should return an idSchema for nested objects', () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: { type: 'string' },
            },
          },
        },
      };

      expect(toIdSchema(schema)).toStrictEqual({
        $id: 'root',
        level1: {
          $id: 'root_level1',
          level2: { $id: 'root_level1_level2' },
        },
      });
    });

    it('should return an idSchema for multiple nested objects', () => {
      const schema = {
        type: 'object',
        properties: {
          level1a: {
            type: 'object',
            properties: {
              level1a2a: { type: 'string' },
              level1a2b: { type: 'string' },
            },
          },
          level1b: {
            type: 'object',
            properties: {
              level1b2a: { type: 'string' },
              level1b2b: { type: 'string' },
            },
          },
        },
      };

      expect(toIdSchema(schema)).toStrictEqual({
        $id: 'root',
        level1a: {
          $id: 'root_level1a',
          level1a2a: { $id: 'root_level1a_level1a2a' },
          level1a2b: { $id: 'root_level1a_level1a2b' },
        },
        level1b: {
          $id: 'root_level1b',
          level1b2a: { $id: 'root_level1b_level1b2a' },
          level1b2b: { $id: 'root_level1b_level1b2b' },
        },
      });
    });

    it('schema with an id property must not corrupt the idSchema', () => {
      const schema = {
        type: 'object',
        properties: {
          metadata: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
            },
            required: ['id'],
          },
        },
      };
      expect(toIdSchema(schema)).toStrictEqual({
        $id: 'root',
        metadata: {
          $id: 'root_metadata',
          id: { $id: 'root_metadata_id' },
        },
      });
    });

    it('should return an idSchema for array item objects', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foo: { type: 'string' },
          },
        },
      };

      expect(toIdSchema(schema)).toStrictEqual({
        $id: 'root',
        foo: { $id: 'root_foo' },
      });
    });

    it('should retrieve referenced schema definitions', () => {
      const schema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' },
            },
          },
        },
        $ref: '#/definitions/testdef',
      };

      expect(toIdSchema(schema, undefined, schema)).toStrictEqual({
        $id: 'root',
        foo: { $id: 'root_foo' },
        bar: { $id: 'root_bar' },
      });
    });

    it('should handle idPrefix parameter', () => {
      const schema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' },
            },
          },
        },
        $ref: '#/definitions/testdef',
      };

      expect(toIdSchema(schema, undefined, schema, {}, 'rjsf')).toStrictEqual({
        $id: 'rjsf',
        foo: { $id: 'rjsf_foo' },
        bar: { $id: 'rjsf_bar' },
      });
    });

    it('should handle null form data for object schemas', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          bar: { type: 'string' },
        },
      };
      const formData = null;
      const result = toIdSchema(schema, null, {}, formData, 'rjsf');

      expect(result).toStrictEqual({
        $id: 'rjsf',
        foo: { $id: 'rjsf_foo' },
        bar: { $id: 'rjsf_bar' },
      });
    });

    it('should handle circular referencing', () => {
      const treeSchema = {
        properties: {},
      };
      treeSchema.properties.tree = treeSchema;
      const rootSchema = {
        definitions: {},
        properties: {
          tree: treeSchema,
        },
        type: 'object',
      };

      const result = toIdSchema(treeSchema, null, rootSchema);

      expect(result).toStrictEqual({
        $id: 'root',
      });
    });
  });

  describe('parseDateString()', () => {
    it('should raise on invalid JSON datetime', () => {
      expect(() => parseDateString('plop')).toThrow('Unable to parse');
    });

    it('should return a default object when no datetime is passed', () => {
      expect(parseDateString()).toStrictEqual({
        year: -1,
        month: -1,
        day: -1,
        hour: -1,
        minute: -1,
        second: -1,
      });
    });

    it('should return a default object when time should not be included', () => {
      expect(parseDateString(undefined, false)).toStrictEqual({
        year: -1,
        month: -1,
        day: -1,
        hour: 0,
        minute: 0,
        second: 0,
      });
    });

    it('should parse a valid JSON datetime string', () => {
      expect(parseDateString('2016-04-05T14:01:30.182Z')).toStrictEqual({
        year: 2016,
        month: 4,
        day: 5,
        hour: 14,
        minute: 1,
        second: 30,
      });
    });

    it('should exclude time when includeTime is false', () => {
      expect(parseDateString('2016-04-05T14:01:30.182Z', false)).toStrictEqual({
        year: 2016,
        month: 4,
        day: 5,
        hour: 0,
        minute: 0,
        second: 0,
      });
    });
  });

  describe('toDateString()', () => {
    it('should transform an object to a valid json datetime if time=true', () => {
      expect(
        toDateString({
          year: 2016,
          month: 4,
          day: 5,
          hour: 14,
          minute: 1,
          second: 30,
        })
      ).toBe('2016-04-05T14:01:30.000Z');
    });

    it('should transform an object to a valid date string if time=false', () => {
      expect(
        toDateString(
          {
            year: 2016,
            month: 4,
            day: 5,
          },
          false
        )
      ).toBe('2016-04-05');
    });
  });

  describe('pad()', () => {
    it('should pad a string with 0s', () => {
      expect(pad(4, 3)).toBe('004');
    });
  });

  describe('dataURItoBlob()', () => {
    it('should return the name of the file if present', () => {
      const { blob, name } = dataURItoBlob('data:image/png;name=test.png;base64,VGVzdC5wbmc=');
      expect(name).toBe('test.png');
      expect(blob).toHaveProperty('size', 8);
      expect(blob).toHaveProperty('type', 'image/png');
    });

    it('should return unknown if name is not provided', () => {
      const { blob, name } = dataURItoBlob('data:image/png;base64,VGVzdC5wbmc=');
      expect(name).toBe('unknown');
      expect(blob).toHaveProperty('size', 8);
      expect(blob).toHaveProperty('type', 'image/png');
    });

    it('should return ignore unsupported parameters', () => {
      const { blob, name } = dataURItoBlob('data:image/png;unknown=foobar;name=test.png;base64,VGVzdC5wbmc=');
      expect(name).toBe('test.png');
      expect(blob).toHaveProperty('size', 8);
      expect(blob).toHaveProperty('type', 'image/png');
    });
  });

  describe('deepEquals()', () => {
    // Note: deepEquals implementation being extracted from node-deeper, it's
    // worthless to reproduce all the tests existing for it; so we focus on the
    // behavioral differences we introduced.
    it('should assume functions are always equivalent', () => {
      expect(
        deepEquals(
          () => {},
          () => {}
        )
      ).toBe(true);
      expect(deepEquals({ foo() {} }, { foo() {} })).toBe(true);
      expect(deepEquals({ foo: { bar() {} } }, { foo: { bar() {} } })).toBe(true);
    });
  });

  describe('guessType()', () => {
    it('should guess the type of array values', () => {
      expect(guessType([1, 2, 3])).toBe('array');
    });

    it('should guess the type of string values', () => {
      expect(guessType('foobar')).toBe('string');
    });

    it('should guess the type of null values', () => {
      expect(guessType(null)).toBe('null');
    });

    it('should treat undefined values as null values', () => {
      expect(guessType()).toBe('null');
    });

    it('should guess the type of boolean values', () => {
      expect(guessType(true)).toBe('boolean');
    });

    it('should guess the type of object values', () => {
      expect(guessType({})).toBe('object');
    });
  });

  describe('getSchemaType()', () => {
    it.each([
      [{ type: 'string' }, 'string'],
      [{ type: 'number' }, 'number'],
      [{ type: 'integer' }, 'integer'],
      [{ type: 'object' }, 'object'],
      [{ type: 'array' }, 'array'],
      [{ type: 'boolean' }, 'boolean'],
      [{ type: 'null' }, 'null'],
      [{ const: 'foo' }, 'string'],
      [{ const: 1 }, 'number'],
      [{ type: ['string', 'null'] }, 'string'],
      [{ type: ['null', 'number'] }, 'number'],
      [{ type: ['integer', 'null'] }, 'integer'],
      [{ properties: {} }, 'object'],
      [{ additionalProperties: {} }, 'object'],
    ])('should correctly guess the type of a schema: %s', (schema, expected) => {
      expect(getSchemaType(schema)).toBe(expected);
    });
  });

  describe('getWidget()', () => {
    const schema = {
      type: 'object',
      properties: {
        object: {
          type: 'object',
          properties: {
            array: {
              type: 'array',
              default: ['foo', 'bar'],
              items: {
                type: 'string',
              },
            },
            bool: {
              type: 'boolean',
              default: true,
            },
          },
        },
      },
    };

    it('should fail if widget has incorrect type', () => {
      // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins
      const Widget = new Number(1);
      expect(() => getWidget(schema, Widget)).toThrow('Unsupported widget definition: object');
    });

    it('should fail if widget has no type property', () => {
      const Widget = 'blabla';
      expect(() => getWidget(schema, Widget)).toThrow('No widget for type "object"');
    });

    it('should not fail on correct component', () => {
      const Widget = props => <div {...props} />;
      expect(getWidget(schema, Widget)({})).toStrictEqual(<Widget options={{}} />);
    });
  });
});

describe('Utils.isCyclic', () => {
  it('should catch inifinite recursion via circular referencing', () => {
    const schema = {
      properties: {
        foo: {
          type: 'object',
          properties: {},
        },
      },
    };
    schema.properties.foo.properties.foo = schema.properties.foo;
    const result = isCyclic(schema.properties.foo, undefined);
    expect(result).toBe(true);
  });

  it('should catch infinite recursion via $ref', () => {
    const schema = {
      type: 'object',
      definitions: {
        node: {
          type: 'object',
          properties: {
            otherNode: {
              $ref: '#/definitions/node',
            },
          },
        },
      },
      properties: {
        tree: {
          title: 'Recursive references',
          $ref: '#/definitions/node',
        },
      },
    };
    const result = isCyclic(schema, schema);
    expect(result).toBe(true);
  });

  it('should return false for non-circular schemas', () => {
    const schema = {
      type: 'object',
      definitions: {
        node: {
          type: 'object',
          properties: {},
        },
      },
      properties: {
        tree: {
          title: 'Recursive references',
          $ref: '#/definitions/node',
        },
      },
    };
    const result = isCyclic(schema, schema);
    expect(result).toBe(false);
  });

  it('should handle multiple references to the same definition', () => {
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
    const result = isCyclic(schema, schema);
    expect(result).toBe(false);
  });

  it('should check type array where array = [{}]', () => {
    const schema = {
      type: 'object',
      definitions: {
        node: {
          type: 'array',
          items: [
            {
              $ref: '#/definitions/node',
            },
          ],
        },
      },
      properties: {
        tree: {
          title: 'Recursive references',
          $ref: '#/definitions/node',
        },
      },
    };
    const result = isCyclic(schema, schema);
    expect(result).toBe(true);
  });

  it('should add an option for omitting running for arrays', () => {
    const schema = {
      type: 'object',
      definitions: {
        tree: {
          $ref: '#/definitions/branch',
        },
        branch: {
          type: 'object',
          properties: {
            leaves: {
              $ref: '#/definitions/seed',
            },
          },
        },
        seed: {
          type: 'array',
          items: [
            {
              $ref: '#/definitions/tree',
            },
          ],
        },
      },
      properties: {
        myTree: {
          $ref: '#/definitions/tree',
        },
      },
    };
    const result = isCyclic(schema, schema, { array: false });
    expect(result).toBe(false);
  });

  it('should pass on a schema that is cyclical, but not in a way that will recurse against itself', () => {
    const schema = {
      type: 'object',
      properties: {
        dateTime: { type: 'string', format: 'date-time' },
        offsetAfter: { $ref: '#/definitions/offset' },
        offsetBefore: { $ref: '#/definitions/offset' },
      },
    };

    const rootSchema = {
      definitions: {
        offset: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            rules: { $ref: '#/definitions/rules' },
          },
        },
        offsetTransition: {
          type: 'object',
          properties: {
            dateTime: { type: 'string', format: 'date-time' },
            offsetAfter: { $ref: '#/definitions/offset' },
            offsetBefore: { $ref: '#/definitions/offset' },
          },
        },
        rules: {
          type: 'object',
          properties: {
            transitions: {
              type: 'array',
              items: { $ref: '#/definitions/offsetTransition' },
            },
          },
        },
      },
      properties: {
        rules: {
          type: 'object',
          properties: {
            transitions: {
              type: 'array',
              items: { $ref: '#/definitions/offsetTransition' },
            },
          },
        },
      },
    };

    const result = isCyclic(schema, rootSchema, { array: false });
    expect(result).toBe(false);
  });

  it('should check type array where array = {}', () => {
    const schema = {
      type: 'object',
      definitions: {
        node: {
          type: 'array',
          items: {
            $ref: '#/definitions/node',
          },
        },
      },
      properties: {
        tree: {
          title: 'Recursive references',
          $ref: '#/definitions/node',
        },
      },
    };
    const result = isCyclic(schema, schema);
    expect(result).toBe(true);
  });

  describe('anyOf, allOf, oneOf', () => {
    it('should support anyOf', () => {
      const schema = {
        anyOf: [{ $ref: '#/definitions/node' }],
        definitions: {
          node: {
            type: 'array',
            items: {
              $ref: '#/definitions/node',
            },
          },
        },
      };

      const result = isCyclic(schema, schema);
      expect(result).toBe(true);
    });

    it('should support allOf', () => {
      const schema = {
        allOf: [{ $ref: '#/definitions/node' }],
        definitions: {
          node: {
            type: 'array',
            items: {
              $ref: '#/definitions/node',
            },
          },
        },
      };

      const result = isCyclic(schema, schema);
      expect(result).toBe(true);
    });

    it('should support oneOf', () => {
      const schema = {
        oneOf: [{ $ref: '#/definitions/node' }],
        definitions: {
          node: {
            type: 'array',
            items: {
              $ref: '#/definitions/node',
            },
          },
        },
      };

      const result = isCyclic(schema, schema);
      expect(result).toBe(true);
    });

    it('should support the nesting of anyOf', () => {
      const schema = {
        anyOf: [
          {
            allOf: [{ $ref: '#/definitions/node' }],
          },
        ],
        definitions: {
          node: {
            type: 'array',
            items: {
              $ref: '#/definitions/node',
            },
          },
        },
      };

      const result = isCyclic(schema, schema);
      expect(result).toBe(true);
    });
  });
});
