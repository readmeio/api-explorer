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
    parametersToJsonSchema(
      {
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
      },
      {},
    ),
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

it('should work for multipart request body (formData)', () => {
  expect(
    parametersToJsonSchema(
      {
        requestBody: {
          description: 'Form data description',
          content: {
            'multipart/form-data': {
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

test('it should pass through maximum & minimum', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'body',
          name: 'number',
          description: 'number',
          schema: {
            type: 'number',
            maximum: 18,
            minimum: 10,
          },
        },
      ],
    }),
  ).toEqual([
    {
      label: 'Body Params',
      type: 'body',
      schema: {
        type: 'object',
        required: [],
        properties: {
          number: {
            description: 'number',
            type: 'number',
            maximum: 18,
            minimum: 10,
          }
        }
      },
    },
  ]);
})
test('it should pass through examples', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'body',
          name: 'number',
          description: 'number',
          examples: [ 15 ],
          schema: {
            type: 'number',
          },
        },
      ],
    }),
  ).toEqual([
    {
      label: 'Body Params',
      type: 'body',
      schema: {
        type: 'object',
        required: [],
        properties: {
          number: {
            description: 'number',
            type: 'number',
            examples: [ 15 ],
          }
        }
      },
    },
  ]);
})
test('it should pass through pattern', () => {
  expect(
    parametersToJsonSchema({
      parameters: [
        {
          in: 'body',
          name: 'number',
          description: 'number',
          schema: {
            type: 'number',
            pattern: '[0-9]{2}$',
          },
        },
      ],
    }),
  ).toEqual([
    {
      label: 'Body Params',
      type: 'body',
      schema: {
        type: 'object',
        required: [],
        properties: {
          number: {
            description: 'number',
            type: 'number',
            pattern: '[0-9]{2}$',
          }
        }
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
  ).toEqual([
    {
      type: 'body',
      label: 'Body Params',
      schema: {
        $ref: '#/components/schemas/Pet',
        components: {
          schemas: {
            Pet: {
              type: 'string',
            },
          },
        },
      },
    },
  ]);
});

test('it should pull out schemas from `components/requestBodies`', () => {
  const oas = {
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
  };
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
        components: oas.components,
      },
    },
  ]);
});

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
  const oas = {
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
  };
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
