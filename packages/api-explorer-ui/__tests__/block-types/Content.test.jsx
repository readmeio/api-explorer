const React = require('react');
const { mount } = require('enzyme');
const Opts = require('../../src/block-types/Content');

describe('Opts', () => {
  test('Maps through content to return text area block type', () => {
    const body = `
    [block:textarea]
    {
      "text": "This is text area"
    }
    [/block]
    `;
    const opts = mount(<Opts body={body} />);

    expect(opts.find('.magic-block-textarea').length).toBe(1);
  });

  test('Maps through content to return html block type', () => {
    const body = `
    [block:html]
    {
      "html": "<p>This is an html</p>"

    }
    [/block]
    `;
    const opts = mount(<Opts body={body} />);

    expect(opts.find('.magic-block-html').length).toBe(1);
  });

  test('Maps through content to return embed block type', () => {
    const body = `
    [block:embed]
    {
      "html": "<iframe class=\\"embedly-embed\\" src=\\"//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FjYjDqzZ4gjY%3Ffeature%3Doembed&url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DjYjDqzZ4gjY&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FjYjDqzZ4gjY%2Fhqdefault.jpg&key=f2aa6fc3595946d0afc3d76cbbd25dc3&type=text%2Fhtml&schema=youtube\\" width=\\"640\\" height=\\"480\\" scrolling=\\"no\\" frameborder=\\"0\\" allowfullscreen></iframe>",
      "url": "https://www.youtube.com/watch?v=jYjDqzZ4gjY",
      "title": "White kids Watch me whip school Chorus - chorus white kids singing Watch me whip",
      "favicon": "https://s.ytimg.com/yts/img/ringo/img/favicon-vfl8qSV2F.ico",
      "image": "https://i.ytimg.com/vi/jYjDqzZ4gjY/hqdefault.jpg",
      "sidebar": true
    }
    [/block]
    `;
    const opts = mount(<Opts body={body} />);

    expect(opts.find('.magic-block-embed').length).toBe(1);
  });

  test('Maps through content to return api header block type', () => {
    const body = `
    [block:api-header]
    {
      "title": "This is cool header",
      "sidebar": true
    }
    [/block]
    `;
    const opts = mount(<Opts body={body} />);

    expect(opts.find('.magic-block-api-header').length).toBe(1);
  });

  xtest('Maps through content to return code block type', () => {
    const body = `
    [block:code]
    {
      "codes": [
         {
            "code": "whjdwhjwejhkwhjk",
            "language": "text",
            "status": 400,
            "name": "    "
          },
          {
            "code": "var a = 1;",
            "language": "javascript"
          }
      ]
    }
    [/block]
    `;
    const opts = mount(<Opts body={body} />);

    expect(opts.find('.magic-block-code').length).toBe(1);
  });
  test('Maps through content to return call out block type', () => {
    const body = `
    [block:callout]
    {
      "type": "info",
      "title": "Callout"
    }
    [/block]
    `;
    const opts = mount(<Opts body={body} />);

    expect(opts.find('.magic-block-callout').length).toBe(1);
  });

  test('Maps through content to return parameters block type', () => {
    const body = `
    [block:parameters]
    {
      "data": {
        "0-0": "arbitrary",
        "0-1": "info",
        "0-2": "test",
        "h-0": "test",
        "h-1": "1",
        "h-2": "2"
      },
      "cols": 3,
      "rows": 1
    }
    [/block]
    `;
    const opts = mount(<Opts body={body} />);

    expect(opts.find('.magic-block-parameters').length).toBe(1);
  });

  test('Maps through content to return image block type', () => {
    const body = `
    [block:image]
    {
      "images": [
        {
          "image": [
            "https://files.readme.io/dce21f0-IMG_0418.JPG",
            "IMG_0418.JPG",
            640,
            1136,
            "#9e918d"
          ],
          "caption": "doggo"
        }
      ]
    }
    [/block]
    `;
    const opts = mount(<Opts body={body} />);

    expect(opts.find('.magic-block-image').length).toBe(1);
  });
});
