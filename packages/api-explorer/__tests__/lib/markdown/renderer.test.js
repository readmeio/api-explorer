const renderer = require('../../../src/lib/markdown/renderer.js');

console.log('hi');
describe('renderer link', () => {
  it('should return a tag with title, href, and text', () => {
    expect(
      renderer.link(
        '/v1.0/docs/getting-started',
        'Getting Started',
        'Getting started with petstore swagger',
      ),
    ).toBe(
      '<a href="/v1.0/docs/getting-started" title="Getting Started">Getting started with petstore swagger</a>',
    );
  });
});
