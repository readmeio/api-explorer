const removeUndefinedObjects = require('../../src/lib/remove-undefined-objects');

test('should remove empty objects with only undefined properties', () => {
  expect(removeUndefinedObjects({ a: { b: undefined, c: { d: undefined } } })).toEqual(undefined);
});

test('should not throw on arrays of primitives', () => {
  expect(removeUndefinedObjects([null])).toEqual([null]);
});

test('should not throw for null', () => {
  expect(removeUndefinedObjects({ a: null })).toEqual({ a: null });
});
