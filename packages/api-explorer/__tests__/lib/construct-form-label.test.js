const constructFormLabel = require('../../src/lib/construct-form-label');

test('should combine prefix and label', () => {
  expect(constructFormLabel('a', 'b')).toBe('a.b');
});

test('should remove falsy values', () => {
  expect(constructFormLabel('', 'b')).toBe('b');
});

test('should remove RAW_BODY', () => {
  expect(constructFormLabel('RAW_BODY')).toBe('');
  expect(constructFormLabel('RAW_BODY', 'b')).toBe('b');
});
