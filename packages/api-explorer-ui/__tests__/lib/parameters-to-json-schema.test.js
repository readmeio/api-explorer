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
  ).toEqual({
    type: 'object',
    definitions: {},
    properties: {
      cookie: {
        description: 'Cookie Params',
        type: 'object',
        properties: {
          'cookie parameter': {
            description: null,
            type: 'string',
          },
        },
        required: [],
      },
      header: {
        description: 'Headers',
        type: 'object',
        properties: {
          'header parameter': {
            description: null,
            type: 'string',
          },
        },
        required: [],
      },
      path: {
        description: 'Path Params',
        type: 'object',
        properties: {
          'path parameter': {
            description: null,
            type: 'string',
          },
        },
        required: [],
      },
      query: {
        description: 'Query Params',
        type: 'object',
        properties: {
          'query parameter': {
            description: null,
            type: 'string',
          },
        },
        required: [],
      },
    },
  });
});

test('it should work for request body inline', () => {
  expect(
    parametersToJsonSchema(
      {
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
      },
      {},
    ),
  ).toEqual({
    type: 'object',
    definitions: {},
    properties: {
      body: {
        description: 'Body Params',
        type: 'object',
        properties: {
          a: { type: 'string' },
        },
      },
    },
  });
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
test('it should pass through description');
