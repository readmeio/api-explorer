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
  ).toBe(schema);

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
  ).toBe(schema);
});

test('should return the requestBody', () => {
  expect(getSchema({ requestBody: schema })).toBe(schema);
});
