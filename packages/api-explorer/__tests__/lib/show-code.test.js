const extensions = require('@mia-platform/oas-extensions');

const showCode = require('../../src/lib/show-code');

test.skip('should return true if there are examples', () => {});
test.skip('should return true if there are results', () => {});
test('should return true if it has try it now', () => {
  expect(showCode({ [extensions.EXPLORER_ENABLED]: true }, {})).toBe(true);
});
test.skip('should return false otherwise', () => {});
