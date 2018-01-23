const { uppercase } = require('../');

test('should uppercase known languages', () => {
  expect(uppercase('http')).toBe('HTTP');
});

test('should pass through unknown languages', () => {
  expect(uppercase('unknown')).toBe('unknown');
});
