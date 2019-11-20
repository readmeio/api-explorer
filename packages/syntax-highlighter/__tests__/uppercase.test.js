const { uppercase } = require('../');

test('should uppercase known languages', () => {
  expect(uppercase('http')).toBe('HTTP');
  expect(uppercase('kotlin')).toBe('Kotlin');
  expect(uppercase('powershell')).toBe('PowerShell');
});

test('should pass through unknown languages', () => {
  expect(uppercase('unknown')).toBe('unknown');
});
