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
