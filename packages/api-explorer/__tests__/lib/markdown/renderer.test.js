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

  it('should convert doc:doc to /docs/doc', () => {
    expect(renderer.link('doc:doc', '', '')).toBe(
      '<a href="/docs/doc" target="_self" class="doc-link" data-sidebar="doc"></a>',
    );
  });

  it('should convert blog:blog to /blog/blog', () => {
    expect(renderer.link('blog:blog', '', '')).toBe('<a href="/blog/blog" target="_self"></a>');
  });

  it('should convert page:custompage to /blog/blog', () => {
    expect(renderer.link('page:custompage', '', '')).toBe(
      '<a href="/page/custompage" target="_self"></a>',
    );
  });
});
