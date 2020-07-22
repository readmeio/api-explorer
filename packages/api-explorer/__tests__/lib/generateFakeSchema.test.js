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
              examples: ['000000000000000000000000'],
              pattern: '^[a-fA-F\\d]{24}$',
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
      title: 'use of examples within properties',
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
      title: 'not supported by json-schema-faker - example key outside the properties',
      schema: {
        type: 'object',
        example: {foo: 'bar'},
        required: ['foo'],
        properties: {
          foo: {
            type: 'string',
          }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).not.toEqual({foo: 'bar'})
        expect(generatedFakeSchema).toEqual({foo: expect.any(String)})
      }
    },
    {
      title: 'not supported by json-schema-faker - example key inside the properties',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'string',
            example: 'bar'
          }
        }
      },
      expectation: generatedFakeSchema => {
        expect(generatedFakeSchema).not.toEqual({foo: 'bar'})
        expect(generatedFakeSchema).toEqual({foo: expect.any(String)})
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
