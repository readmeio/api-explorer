const React = require('react');
const { mount, shallow } = require('enzyme');
const markdown = require('@readme/markdown');
const markdownMagic = require('@readme/markdown-magic');
const DescriptionField = require('../../src/form-components/DescriptionField');

test.each([[true], [false]])('should parse description as markdown [new markdown engine=%s]', useNewMarkdownEngine => {
  const actual = '`all` or a comma-separated list of action [fields](ref:action-object)';

  let html;
  if (useNewMarkdownEngine) {
    html = mount(markdown.react(actual, { copyButtons: false })).html();
  } else {
    html = shallow(markdownMagic(actual)).html();
  }

  expect(shallow(<DescriptionField description={actual} formContext={{ useNewMarkdownEngine }} />).html()).toContain(
    html
  );
});
