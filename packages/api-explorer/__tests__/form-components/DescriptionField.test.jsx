const React = require('react');
const { shallow } = require('enzyme');
const markdown = require('@readme/markdown');
const markdownMagic = require('@readme/markdown-magic');
const DescriptionField = require('../../src/form-components/DescriptionField');

test.each([[true], [false]])('should parse description as markdown [new markdown engine=%s]', useNewMarkdownEngine => {
  const actual = '`all` or a comma-separated list of action [fields](ref:action-object)';

  let html;
  if (useNewMarkdownEngine) {
    html = shallow(markdown.react(actual)).html();
  } else {
    html = shallow(markdownMagic(actual)).html();
  }

  // I wanted to use http://airbnb.io/enzyme/docs/api/ShallowWrapper/contains.html here but it wasnt working
  expect(
    shallow(<DescriptionField description={actual} formContext={{ useNewMarkdownEngine }} />)
      .html()
      .indexOf(html) > 1
  ).toBe(true);
});
