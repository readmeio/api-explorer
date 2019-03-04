const contentTypeIsJson = require('../../src/lib/content-type-is-json');

describe('contentTypeIsJson', () => {
  it('should return true if application/json', () => {
    const contentType = 'application/json';
    expect(contentTypeIsJson(contentType)).toBe(true);
  });

  it('should return true if application/vnd.api+json', () => {
    const contentType = 'application/vnd.api+json';
    expect(contentTypeIsJson(contentType)).toBe(true);
  });

  it('should return false otherwise', () => {
    const contentType = 'text/html';
    expect(contentTypeIsJson(contentType)).toBe(false);
  });
});
