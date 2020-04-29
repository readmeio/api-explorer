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

> 🎟  
> 
> Callout with no title or theme.

`,
    ];
    const wrap = [mount(markdown.react(callout[0])), mount(markdown.react(callout[1]))];
    expect(wrap[0].html()).toBe(
      '<blockquote class="callout callout_error" theme="❗️"><h3 class="callout-heading false"><span class="callout-icon">❗️</span><p>Error Callout</p></h3><p>Lorem ipsum dolor.</p></blockquote>'
    );
    expect(wrap[1].html()).toBe(
      '<blockquote class="callout callout_default" theme="🎟"><h3 class="callout-heading empty"><span class="callout-icon">🎟</span><p>Callout with no title or theme.</p></h3></blockquote>'
    );
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
    const wrap = mount(
      markdown.react('[Embed Title](https://gist.github.com/chaddy81/f852004d6d1510eec1f6 "@jsfiddle")')
    );
    expect(wrap.html()).toMatchSnapshot();
  });

  it('Heading', () => {
    const wrap = mount(markdown.react('### Heading Level 3\n\n### Heading Level 3'));
    expect(wrap.find('Heading')).toHaveLength(2);

    const blank = mount(markdown.react('Pretest.\n\n###\n\nPosttest.'));
    expect(blank.find('Heading').text()).toBe('');
  });
});
