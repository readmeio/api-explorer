import generateFakeSchema from '../../lib/generateFakeSchema'

jest.unmock('json-schema-faker')

describe('generateFakeSchema', () => {
  const generateFakeSchemaTests = [
    {
      title: 'basic usage of examples',
      schema: {
        type: 'object',
        examples: [{ foo: 'bar' }],
        required: ['foo'],
        properties: {
          foo: { type: 'string' }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).toEqual({foo: 'bar'})
      }
    },
    {
      title: 'basic usage of example',
      schema: {
        type: 'object',
        example: { foo: 'bar' },
        required: ['foo'],
        properties: {
          foo: { type: 'string' }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).toEqual({foo: 'bar'})
      }
    },
    {
      title: 'example of schema from crud-service',
      schema: {
        type: 'array',
        maxItems: 1,
        items: {
          type: 'object',
          required: ['_id', 'creatorId', 'createdAt', 'updaterId', 'updatedAt', '__STATE__'],
          properties: {
            _id: {
              type: 'string',
              pattern: '^[a-fA-F\\d]{24}$',
              example: '000000000000000000000000',
              description: '_id'
            },
            creatorId: {
              type: 'string',
              description: 'creatorId'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'createdAt'
            },
            updaterId: {
              type: 'string',
              description: 'updaterId'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'updatedAt'
            },
            __STATE__: {
              type: 'string',
              description: '__STATE__'
            }
          }
        }
      },
      expectation: (generatedFakeSchema) => {
        // eslint-disable-next-line no-useless-escape
        const dateTimeRgx = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).([0-9A-Za-z]{1,})/
        const item = generatedFakeSchema[0]
        const {_id, creatorId, createdAt, updaterId, updatedAt, __STATE__} = item

        expect(_id).toEqual('000000000000000000000000')
        expect(creatorId).toEqual(expect.any(String))
        expect(createdAt.match(dateTimeRgx)).toBeTruthy()
        expect(updaterId).toEqual(expect.any(String))
        expect(updatedAt.match(dateTimeRgx)).toBeTruthy()
        // eslint-disable-next-line no-underscore-dangle
        expect(__STATE__).toEqual(expect.any(String))
      }
    },
    {
      title: 'use examples in a single field',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'string',
            examples: ['bar2']
          }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).toEqual({foo: 'bar2'})
      }
    },
    {
      title: 'use example in a single field',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'string',
            example: 'bar2'
          }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).toEqual({foo: 'bar2'})
      }
    },
    {
      title: 'generated field match pattern',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'string',
            pattern: '^[a-fA-F\\d]{24}$'
          }
        }
      },
      expectation: (generatedFakeSchema, schema) => {
        expect(generatedFakeSchema.foo.match(schema.properties.foo.pattern)).toBeTruthy()
      }
    },
    {
      title: 'use example as array of string outside the items',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'array',
            example: ['array'],
            items: {
              type: 'string'
            }
          },
          randomKey: {
            type: 'string'
          }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).toEqual({foo: ['array'], randomKey: expect.any(String)})
      }
    },
    {
      title: 'use example in array of object',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'array',
            minItems: 1,
            maxItems: 1,
            items: {
              type: 'object',
              properties: {
                fooChildren: {
                  type: 'string',
                  example: 'nestedBar'
                }
              }
            }
          },
          randomKey: {
            type: 'string'
          }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).toEqual({foo: [{fooChildren: 'nestedBar'}], randomKey: expect.any(String)})
      }
    },
    {
      title: 'use example outside properties in array of object',
      schema: {
        type: 'object',
        required: ['foo'],
        example: {foo: [{fooChildren: 'nestedBar'}]},
        properties: {
          foo: {
            type: 'array',
            minItems: 1,
            maxItems: 1,
            items: {
              type: 'object',
              properties: {
                fooChildren: {
                  type: 'string',
                }
              }
            }
          },
          randomKey: {
            type: 'string'
          }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).toEqual({foo: [{fooChildren: 'nestedBar'}], randomKey: expect.any(String)})
      }
    },
    {
      title: 'use example key in properties not used as real example',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          example: {
            type: 'string'
          },
          foo: {
            type: 'string',
            example: 'bar'
          },
          randomKey: {
            type: 'string'
          }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).toEqual({example: expect.any(String), foo: 'bar', randomKey: expect.any(String)})
      }
    },
    {
      title: 'use example key in properties not used as real example in nested case',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          example: {
            type: 'object',
            properties: {
              example: {
                type: 'string'
              }
            }
          },
          foo: {
            type: 'string',
            example: 'bar'
          },
          randomKey: {
            type: 'string'
          }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).toEqual({example: {example: expect.any(String)}, foo: 'bar', randomKey: expect.any(String)})
      }
    }
  ]

  generateFakeSchemaTests.forEach((schemaTest) => {
    const {title, schema, expectation} = schemaTest
    test(title, () => {
      const result = generateFakeSchema(schema)
      expectation(result, schema)
    })
  })
})
