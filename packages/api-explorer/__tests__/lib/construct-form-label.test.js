const constructFormLabel = require('../../src/lib/construct-form-label');

test('should combine prefix and label', () => {
  expect(constructFormLabel('a', 'b')).toBe('a.b');
});

test('should remove falsy values', () => {
  expect(constructFormLabel('', 'b')).toBe('b');
});

test('should remove TOP_LEVEL', () => {
  expect(constructFormLabel('TOP_LEVEL')).toBe('');
  expect(constructFormLabel('TOP_LEVEL', 'b')).toBe('b');
});
