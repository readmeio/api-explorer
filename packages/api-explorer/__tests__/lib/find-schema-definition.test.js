const findSchemaDefinition = require('../../src/lib/find-schema-definition');

test('should throw an error if there is an invalid ref', () => {
  expect(() => findSchemaDefinition('some-other-ref', {})).toThrowError(
    /Could not find a definition for/,
  );
});

test('should throw an error if there is a missing ref', () => {
  expect(() => findSchemaDefinition('#/components/schemas/user', {})).toThrowError(
    /Could not find a definition for/,
  );
});
