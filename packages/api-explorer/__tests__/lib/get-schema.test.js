const getSchema = require('../../src/lib/get-schema');

const schema = { type: 'string' };

test('should return the first type if there is content', () => {
  expect(
    getSchema({
      requestBody: {
        content: {
          'application/json': {
            schema,
          },
          'text/xml': {
            schema: { type: 'number' },
          },
        },
      },
    }),
  ).toEqual({ type: 'application/json', schema });

  expect(
    getSchema({
      requestBody: {
        content: {
          'text/xml': {
            schema,
          },
          'application/json': {
            schema: { type: 'number' },
          },
        },
      },
    }),
  ).toEqual({ type: 'text/xml', schema });
});

test('should return undefined', () => {
  expect(getSchema({})).toBe(undefined);
});

test('should return if theres a $ref on the top level', () => {
  const $ref = '#/definitions/schema';
  expect(getSchema({ requestBody: { $ref } })).toEqual({
    type: 'application/json',
    schema: { $ref },
  });
});

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#requestBodyObject
test('should look up the schema if it looks like the first $ref is a request body object', () => {
  const $ref = '#/components/schemas/schema';
  expect(
    getSchema(
      {
        requestBody: { $ref: '#/components/requestBodies/schema' },
      },
      {
        components: {
          requestBodies: { schema: { content: { 'application/json': { schema: { $ref } } } } },
        },
      },
    ).schema.$ref,
  ).toEqual($ref);
});

test('should return the inline schema from request body object', () => {
  expect(
    getSchema(
      {
        requestBody: { $ref: '#/components/requestBodies/schema' },
      },
      {
        components: { requestBodies: { schema: { content: { 'application/json': { schema } } } } },
      },
    ).schema,
  ).toEqual(schema);
});
