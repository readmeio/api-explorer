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
