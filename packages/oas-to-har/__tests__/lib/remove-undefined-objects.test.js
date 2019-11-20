const removeUndefinedObjects = require('../../src/lib/remove-undefined-objects');

test('should remove empty objects with only undefined properties', () => {
  expect(removeUndefinedObjects({ a: { b: undefined, c: { d: undefined } } })).toBeUndefined();
});

test('should not throw on arrays of primitives', () => {
  expect(removeUndefinedObjects([null])).toStrictEqual([null]);
});

test('should not throw for null', () => {
  expect(removeUndefinedObjects({ a: null })).toStrictEqual({ a: null });
});
