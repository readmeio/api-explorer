const { mount } = require('enzyme');
const React = require('react');
const markdown = require('../index');

describe('Data Replacements', () => {
  it('Variables', () => {
    const wrapper = mount(
      React.createElement(
        markdown.utils.VariablesContext.Provider,
        {
          value: {
            defaults: [{ test: 'Default Value' }],
            user: { test: 'User Override' },
          },
        },
        markdown.react(`<<test>>`)
      )
    );
    expect(wrapper.html()).toBe('<p><span>User Override</span></p>');
  });

  it('Glossary Term', () => {
    const wrapper = mount(
      React.createElement(
        markdown.utils.GlossaryContext.Provider,
        {
          value: [
            {
              term: 'term',
              definition: 'a word or phrase used to describe a thing or to express a concept.',
              _id: '1',
            },
          ],
        },
        markdown.react(`<<glossary:term>>`)
      )
    );
    expect(wrapper.html()).toBe(
      '<p><span class="glossary-tooltip" v="term"><span class="glossary-item highlight">term</span><span class="tooltip-content"><span class="tooltip-content-body"><strong class="term">term</strong> - a word or phrase used to describe a thing or to express a concept.</span></span></span></p>'
    );
  });
});

describe('Components', () => {
  it('Callout', () => {
    const callout = [
      `

> ❗️ Error Callout
>
> Lorem ipsum dolor.

`,
      `

> 🚧  
> 
> Callout with no title.

`,
      `[block:callout]
{
  "type": "warning",
  "body": "Callout with no title."
}
[/block]`,
    ];
    const wrap = [
      mount(markdown.react(callout[0])),
      mount(markdown.react(callout[1])),
      mount(markdown.react(callout[2])),
    ];

    expect(wrap[0].html()).toMatchSnapshot();

    const noTitleExpectation =
      '<blockquote class="callout callout_warn" theme="🚧"><h3 class="callout-heading empty"><span class="callout-icon">🚧</span></h3><p>Callout with no title.</p></blockquote>';
    expect(wrap[1].html()).toBe(noTitleExpectation);
    expect(wrap[2].html()).toBe(noTitleExpectation);
  });

  it('Multi Code Block', () => {
    const tabs = '```\nhello\n```\n```php\nworld\n```\n\n';
    const rdmd = markdown.react(tabs);
    const wrap = mount(rdmd);

    expect(wrap.find('pre').at(1).getDOMNode().classList).toHaveLength(0);

    wrap.find('.CodeTabs-toolbar button').at(1).simulate('click').simulate('click');

    expect(wrap.find('pre').at(1).getDOMNode().classList).toContain('CodeTabs_active');
  });

  it('Embed', () => {
    const fixtures = {
      html: `[block:embed]
      {
        "html": "<iframe class=\\"embedly-embed\\" src=\\"//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.google.com%2Fmaps%2Fembed%2Fv1%2Fplace%3Fcenter%3D37.829698%252C-122.258166%26key%3DAIzaSyD9HrlRuI1Ani0-MTZ7pvzxwxi4pgW0BCY%26zoom%3D16%26q%3D4126%2BOpal%2BSt%2C%2BOakland%2C%2BCA%2B94609&display_name=Google+Maps&url=https%3A%2F%2Fwww.google.com%2Fmaps%2Fplace%2F4126%2BOpal%2BSt%2C%2BOakland%2C%2BCA%2B94609%2F%4037.829698%2C-122.258166%2C16z%2Fdata%3D%214m5%213m4%211s0x80857dfb145a04ff%3A0x96b17d967421636f%218m2%213d37.8296978%214d-122.2581661%3Fhl%3Den&image=http%3A%2F%2Fmaps-api-ssl.google.com%2Fmaps%2Fapi%2Fstaticmap%3Fcenter%3D37.829698%2C-122.258166%26zoom%3D15%26size%3D250x250%26sensor%3Dfalse&key=02466f963b9b4bb8845a05b53d3235d7&type=text%2Fhtml&schema=google\\" width=\\"600\\" height=\\"450\\" scrolling=\\"no\\" title=\\"Google Maps embed\\" frameborder=\\"0\\" allow=\\"autoplay; fullscreen\\" allowfullscreen=\\"true\\"></iframe>",
        "url": "https://www.google.com/maps/place/4126+Opal+St,+Oakland,+CA+94609/@37.829698,-122.258166,16z/data=!4m5!3m4!1s0x80857dfb145a04ff:0x96b17d967421636f!8m2!3d37.8296978!4d-122.2581661?hl=en",
        "title": "4126 Opal St, Oakland, CA 94609",
        "favicon": "https://www.google.com/images/branding/product/ico/maps15_bnuw3a_32dp.ico",
        "image": "http://maps-api-ssl.google.com/maps/api/staticmap?center=37.829698,-122.258166&zoom=15&size=250x250&sensor=false"
      }
      [/block]`,
      iframe: `[block:embed]
      {
        "html": false,
        "url": "https://consent-manager.metomic.io/placeholder-demo.html?example=reddit",
        "title": null,
        "favicon": null,
        "iframe": true,
        "height": "550"
      }
      [/block]`,
      meta: `[block:embed]
      {
        "html": false,
        "url": "https://www.nytimes.com/2020/05/03/us/politics/george-w-bush-coronavirus-unity.html",
        "title": "George W. Bush Calls for End to Pandemic Partisanship",
        "favicon": "https://www.nytimes.com/vi-assets/static-assets/favicon-4bf96cb6a1093748bf5b3c429accb9b4.ico",
        "image": "https://static01.nyt.com/images/2020/05/02/world/02dc-virus-bush-2/merlin_171999921_e857a690-fb9b-462d-a20c-28c8161107c9-facebookJumbo.jpg"
      }
      [/block]`,
      rdmd: `[](https://www.nytimes.com/2020/05/03/us/politics/george-w-bush-coronavirus-unity.html "@embed")`,
    };
    Object.values(fixtures).map(fx => {
      const wrap = mount(markdown.react(fx));
      return expect(wrap.html()).toMatchSnapshot();
    });
  });

  it('Image', () => {
    const text =
      '![Bro eats pizza and makes an OK gesture.](https://files.readme.io/6f52e22-man-eating-pizza-and-making-an-ok-gesture.jpg "Pizza Face")';

    const wrap = mount(markdown.react(text));
    expect(wrap.html()).toMatchSnapshot();

    const img = wrap.find('img').at(0);
    const box = wrap.find('.lightbox').at(0);

    img.simulate('click');
    expect(box.getDOMNode(0).hasAttribute('open')).toBe(true);

    box.simulate('scroll');
    expect(box.getDOMNode(0).hasAttribute('open')).toBe(false);

    img.simulate('keydown', { key: 'Enter' });
    expect(box.getDOMNode(0).hasAttribute('open')).toBe(true);

    img.simulate('keydown', { key: 'Escape' });
    expect(box.getDOMNode(0).hasAttribute('open')).toBe(false);

    img.simulate('keydown', { key: ' ' });
    expect(box.getDOMNode(0).hasAttribute('open')).toBe(true);

    img.simulate('keydown', { key: '.', metaKey: true });
    expect(box.getDOMNode(0).hasAttribute('open')).toBe(false);
  });

  it('Heading', () => {
    const wrap = mount(markdown.react('### Heading Level 3\n\n### Heading Level 3'));
    expect(wrap.find('Heading')).toHaveLength(2);

    const blank = mount(markdown.react('Pretest.\n\n###\n\nPosttest.'));
    expect(blank.find('Heading').text()).toBe('');
  });
});
