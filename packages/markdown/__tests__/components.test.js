const { mount, shallow } = require('enzyme');
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
        markdown.react(`<<test>>`),
      ),
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
        markdown.react(`<<glossary:term>>`),
      ),
    );
    expect(wrapper.html()).toBe(
      '<p><span class="glossary-tooltip" v="term"><span class="glossary-item highlight">term</span><span class="tooltip-content"><span class="tooltip-content-body"><strong class="term">term</strong> - a word or phrase used to describe a thing or to express a concept.</span></span></span></p>',
    );
  });
});

const callout = `

> ❗️ Error Callout
>
> Lorem ipsum dolor.

`;

const codetabs = `

\`\`\`
hello
\`\`\`
\`\`\`
world
\`\`\`

`;

describe('Components', () => {
  it('Callout', () => {
    const wrap = mount(markdown.react(callout));
    expect(wrap.html()).toBe(
      '<blockquote class="callout callout_error"><h3 class="false"><p>❗️ Error Callout</p></h3><p>Lorem ipsum dolor.</p></blockquote>',
    );
  });

  it('Multi Code Block', () => {
    const wrap = mount(markdown.react(codetabs));
    expect(wrap.html()).toBe(
      '<div class="CodeTabs CodeTabs_initial"><div class="CodeTabs-toolbar"><button type="button">(plaintext)</button><button type="button">(plaintext)</button></div><div class="CodeTabs-inner"><pre><code data-lang="" name=""><span class="cm-s-neo">hello\n</span></code></pre><pre><code data-lang="" name=""><span class="cm-s-neo">world\n</span></code></pre></div></div>',
    );
  });

  it('Embed', () => {
    const wrap = shallow(
      markdown.react('[Embed Title](https://jsfiddle.net/rafegoldberg/5VA5j/ "@jsfiddle")'),
    );
    expect(wrap.html()).toBe('<div class="embed"><div class="embed-media"></div></div>');
  });

  it('Heading', () => {
    const wrap = mount(markdown.react('### Heading Level 3\n\n### Heading Level 3'));
    expect(wrap.html()).toBe(
      '<h3 class="heading header-scroll"><div class="anchor waypoint" id="section-heading-level-3"></div><div>Heading Level 3</div><a class="fa fa-anchor" href="#section-heading-level-3"></a></h3>\n<h3 class="heading header-scroll"><div class="anchor waypoint" id="section-heading-level-3-1"></div><div>Heading Level 3</div><a class="fa fa-anchor" href="#section-heading-level-3-1"></a></h3>',
    );
  });
});
