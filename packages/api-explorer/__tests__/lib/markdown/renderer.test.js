const renderer = require('../../../src/lib/markdown/renderer.js');

describe('renderer link', () => {
  it('should return a tag with title, href, and text', () => {
    expect(
      renderer.link(
        '/v1.0/docs/getting-started',
        'Getting Started',
        'Getting started with petstore swagger',
      ),
    ).toBe(
      '<a href="/v1.0/docs/getting-started" target="_self" title="Getting Started">Getting started with petstore swagger</a>',
    );
  });

  it('should return a tag with text and href', () => {
    expect(
      renderer.link('/v1.0/blog/getting-started', '', 'Getting started with petstore swagger'),
    ).toBe(
      '<a href="/v1.0/blog/getting-started" target="_self">Getting started with petstore swagger</a>',
    );
  });

  it('should return a tag with href', () => {
    expect(renderer.link('/v1.0/page/getting-started', '', '')).toBe(
      '<a href="/v1.0/page/getting-started" target="_self"></a>',
    );
  });
});
