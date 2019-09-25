const parametersToJsonSchema = require('../../src/lib/parameters-to-json-schema');
const Oas = require('../../src/lib/Oas.js');

test('it should return with null if there are no parameters', async () => {
  expect(parametersToJsonSchema({ parameters: [] })).toBe(null);
  expect(parametersToJsonSchema({})).toBe(null);
});

test('it should return with a json schema for each parameter type', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        { in: 'path', name: 'path parameter' },
        { in: 'query', name: 'query parameter' },
        { in: 'header', name: 'header parameter' },
        { in: 'cookie', name: 'cookie parameter' },
      ],
    }),
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

test('should work for server variables', () => {
  expect(
    parametersToJsonSchema(
      {},
      new Oas({
        servers: [
          {
            url: 'https://{username}.example.com',
            variables: { username: { default: 'demo' } },
          },
        ],
      }),
    ),
  ).toEqual([
    {
      label: 'Server Variables',
      type: 'server',
      schema: {
        type: 'object',
        properties: {
          username: {
            default: 'demo',
            type: 'string',
          },
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

test('it should pass through type for non-body parameters', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'query',
          name: 'checkbox',
          schema: {
            type: 'boolean',
          },
        },
      ],
    })[0].schema.properties.checkbox.type,
  ).toEqual('boolean');
});

test('it should pass through type for non-body parameters that are arrays', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'query',
          name: 'options',
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      ],
    })[0].schema.properties.options.type,
  ).toEqual('array');
});

test('it should pass through format', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'query',
          name: 'checkbox',
          schema: {
            type: 'integer',
            format: 'int32',
          },
        },
      ],
    })[0].schema.properties.checkbox.format,
  ).toEqual('int32');
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

test('it should work for top-level request body $ref', () => {
  expect(
    parametersToJsonSchema(
      {
        requestBody: {
          $ref: '#/components/schemas/Pet',
        },
      },
      new Oas({
        components: {
          schemas: {
            Pet: {
              type: 'string',
            },
          },
        },
      }),
    ),
  ).toEqual([
    {
      type: 'body',
      label: 'Body Params',
      schema: {
        $ref: '#/components/schemas/Pet',
        definitions: {
          components: {
            schemas: {
              Pet: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  ]);
});

test('it should pull out schemas from `components/requestBodies`', () => {
  const oas = new Oas({
    components: {
      requestBodies: {
        Pet: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Pet',
              },
            },
          },
        },
      },
      schemas: {
        Pet: {
          type: 'string',
        },
      },
    },
  });
  expect(
    parametersToJsonSchema(
      {
        requestBody: {
          $ref: '#/components/requestBodies/Pet',
        },
      },
      oas,
    ),
  ).toEqual([
    {
      type: 'body',
      label: 'Body Params',
      schema: {
        $ref: '#/components/schemas/Pet',
        definitions: {
          components: oas.components,
        },
      },
    },
  ]);
});

test.skip('it should make things required correctly', () => {});

test('it should pass false value as default parameter', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'query',
          name: 'check',
          schema: {
            type: 'boolean',
            default: false,
          },
        },
      ],
    })[0].schema.properties.check,
  ).toEqual({ default: false, type: 'boolean' });
});

test('it should fetch $ref parameters', () => {
  const oas = new Oas({
    components: {
      parameters: {
        Param: {
          name: 'param',
          in: 'query',
          schema: {
            type: 'string',
          },
        },
      },
    },
  });
  expect(
    parametersToJsonSchema(
      {
        parameters: [
          {
            $ref: '#/components/parameters/Param',
          },
        ],
      },
      oas,
    )[0].schema.properties.param,
  ).toEqual(oas.components.parameters.Param.schema);
});

test('it should fetch parameters that have a child $ref', () => {
  const oas = new Oas({
    components: {
      schemas: {
        string_enum: {
          name: 'string',
          enum: ['available', 'pending', 'sold'],
          type: 'string',
        },
      },
    },
  });

  expect(
    parametersToJsonSchema(
      {
        parameters: [
          {
            in: 'query',
            name: 'param',
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/string_enum',
              },
            },
          },
        ],
      },
      oas,
    )[0].schema.properties.param.items,
  ).toEqual(oas.components.schemas.string_enum);
});

test('it should add common parameter to path params', () => {
  const oas = {
    paths: {
      '/pet/{petId}': {
        parameters: [
          {
            name: 'petId',
            in: 'path',
            description: 'ID of pet to return',
            required: true,
          },
        ],
      },
    },
  };

  expect(
    parametersToJsonSchema({
      path: '/pet/{petId}',
      oas,
    })[0].schema.properties.petId.description,
  ).toEqual(oas.paths['/pet/{petId}'].parameters[0].description);
});

test('it should override path-level parameters on the operation level', () => {
  const oas = {
    paths: {
      '/pet/{petId}': {
        parameters: [
          {
            name: 'petId',
            in: 'path',
            description: 'ID of pet to return',
            required: true,
          },
        ],
      },
    },
  };

  expect(
    parametersToJsonSchema({
      path: '/pet/{petId}',
      parameters: [
        {
          name: 'petId',
          in: 'path',
          description: 'A comma-separated list of pet IDs',
          required: true,
        },
      ],
      oas,
    })[0].schema.properties.petId.description,
  ).toEqual('A comma-separated list of pet IDs');
});
