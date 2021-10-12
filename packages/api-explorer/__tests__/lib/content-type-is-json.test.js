const contentTypeIsJson = require('../../src/lib/content-type-is-json');

describe('contentTypeIsJson', () => {

  it('should return true for supported content type', () => {
    [
      'application/json',
      'application/vnd.api+json',
      'application/fhir+json',
      'application/fhir+json;charset=utf-8'
    ].map(contentTypeIsJson).forEach(value => expect(value).toBe(true))
  });

  it('should return false otherwise', () => {
    const contentType = 'text/html';
    expect(contentTypeIsJson(contentType)).toBe(false);
  });
});
