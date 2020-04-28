const removeUndefinedObjects = require('../../src/lib/remove-undefined-objects');

test('should remove empty objects with only undefined properties', () => {
  expect(removeUndefinedObjects({ a: { b: undefined, c: { d: undefined } } })).toBeUndefined();
});

test('should remove empty arrays from within object', () => {
  expect(removeUndefinedObjects({ a: { b: undefined, c: { d: undefined } }, d: [1234, undefined] })).toStrictEqual({
    d: [1234],
  });
});

test('should remove undefined and null values from arrays', () => {
  expect(removeUndefinedObjects([undefined, undefined])).toBeUndefined();
  expect(removeUndefinedObjects([null])).toBeUndefined();
  expect(removeUndefinedObjects(['1234', null, undefined, { a: null, b: undefined }])).toStrictEqual([
    '1234',
    {
      a: null,
    },
  ]);
});
