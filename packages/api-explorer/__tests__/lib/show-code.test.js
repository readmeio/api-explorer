const extensions = require('@readme/oas-extensions');

const showCode = require('../../src/lib/show-code');

test.todo('should return true if there are examples');

test.todo('should return true if there are results');

test('should return true if it has try it now', () => {
  expect(showCode({ [extensions.EXPLORER_ENABLED]: true }, {})).toBe(true);
});

test.todo('should return false otherwise');
