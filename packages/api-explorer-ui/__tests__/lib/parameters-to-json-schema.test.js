const parametersToJsonSchema = require('../../src/lib/parameters-to-json-schema');

test('it should return with null if there are no parameters', async () => {
  expect(parametersToJsonSchema({ parameters: [] })).toBe(null);
  expect(parametersToJsonSchema({})).toBe(null);
});

test('it should return with a json schema for each parameter type', () => {
  expect(
    parametersToJsonSchema(
      {
        parameters: [
          { in: 'path', name: 'path parameter' },
          { in: 'query', name: 'query parameter' },
          { in: 'header', name: 'header parameter' },
          { in: 'cookie', name: 'cookie parameter' },
        ],
      },
      {},
    ),
  ).toEqual([
    {
      label: 'Path Params',
      type: 'path',
      schema: {
        type: 'object',
        properties: {
          'path parameter': {
            type: 'string',
          },
        },
        required: [],
      },
    },
    {
      label: 'Query Params',
      type: 'query',
      schema: {
        type: 'object',
        properties: {
          'query parameter': {
            type: 'string',
          },
        },
        required: [],
      },
    },
    {
      label: 'Cookie Params',
      type: 'cookie',
      schema: {
        type: 'object',
        properties: {
          'cookie parameter': {
            type: 'string',
          },
        },
        required: [],
      },
    },
    {
      label: 'Headers',
      type: 'header',
      schema: {
        type: 'object',
        properties: {
          'header parameter': {
            type: 'string',
          },
        },
        required: [],
      },
    },
  ]);
});

test('it should work for request body inline (json)', () => {
  expect(
    parametersToJsonSchema({
      requestBody: {
        description: 'Body description',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { a: { type: 'string' } },
            },
          },
        },
      },
    }),
  ).toEqual([
    {
      label: 'Body Params',
      type: 'body',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string' },
        },
      },
    },
  ]);
});

test('it should work for request body inline (formData)', () => {
  expect(
    parametersToJsonSchema({
      requestBody: {
        description: 'Form data description',
        content: {
          'application/x-www-form-urlencoded': {
            schema: {
              type: 'object',
              properties: { a: { type: 'string' } },
            },
          },
        },
      },
    }),
  ).toEqual([
    {
      label: 'Form Data',
      type: 'formData',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string' },
        },
      },
    },
  ]);
});

test('should pass through enum', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'header',
          name: 'Accept',
          required: false,
          schema: {
            type: 'string',
            enum: ['application/json', 'application/xml'],
          },
        },
      ],
    }),
  ).toEqual([
    {
      label: 'Headers',
      type: 'header',
      schema: {
        type: 'object',
        properties: {
          Accept: {
            type: 'string',
            enum: ['application/json', 'application/xml'],
          },
        },
        required: [],
      },
    },
  ]);
});

test('should pass through defaults', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'header',
          name: 'Accept',
          schema: {
            type: 'string',
            default: 'application/json',
          },
        },
      ],
    }),
  ).toEqual([
    {
      label: 'Headers',
      type: 'header',
      schema: {
        type: 'object',
        properties: {
          Accept: {
            default: 'application/json',
            type: 'string',
          },
        },
        required: [],
      },
    },
  ]);
});

test('it should pass through description', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'header',
          name: 'Accept',
          description: 'Expected response format.',
          schema: {
            type: 'string',
          },
        },
      ],
    }),
  ).toEqual([
    {
      label: 'Headers',
      type: 'header',
      schema: {
        type: 'object',
        properties: {
          Accept: {
            description: 'Expected response format.',
            type: 'string',
          },
        },
        required: [],
      },
    },
  ]);
});

test.skip('it should work for top-level request body $ref', () => {
  expect(
    parametersToJsonSchema(
      {
        requestBody: {
          $ref: '#/components/schemas/Pet',
        },
      },
      {
        components: {
          schemas: {
            Pet: {
              type: 'string',
            },
          },
        },
      },
    ),
  ).toEqual({
    type: 'object',
    definitions: {
      components: {
        schemas: {
          Pet: {
            type: 'string',
          },
        },
      },
    },
    properties: {
      body: {
        description: 'Body Params',
        schema: {
          type: 'string',
        },
      },
    },
  });
});

test.skip('it should work for nested in content-type request body $ref', () => {
  expect(
    parametersToJsonSchema(
      {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Pet',
              },
            },
          },
        },
      },
      {
        components: {
          schemas: {
            Pet: {
              type: 'string',
            },
          },
        },
      },
    ),
  ).toEqual({
    type: 'object',
    definitions: {
      components: {
        schemas: {
          Pet: {
            type: 'string',
          },
        },
      },
    },
    properties: {
      body: {
        description: 'Body Params',
        schema: {
          type: 'string',
        },
      },
    },
  });
});

test.skip('it should work for schemas not in components/schemas', () => {
  expect(
    parametersToJsonSchema(
      {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/requestBodies/Pet',
              },
            },
          },
        },
      },
      {
        components: {
          requestBodies: {
            Pet: {
              type: 'string',
            },
          },
        },
      },
    ),
  ).toEqual({
    type: 'object',
    definitions: {
      components: {
        requestBodies: {
          Pet: {
            type: 'string',
          },
        },
      },
    },
    properties: {
      body: {
        description: 'Body Params',
        schema: {
          type: 'string',
        },
      },
    },
  });
});

test('it should make things required correctly');
