const React = require('react');
const { shallow } = require('enzyme');
const markdown = require('@readme/markdown');
const DescriptionField = require('../../src/form-components/DescriptionField');

test('should parse description as markdown', () => {
  const actual = '`all` or a comma-separated list of action [fields](ref:action-object)';

  // I wanted to use http://airbnb.io/enzyme/docs/api/ShallowWrapper/contains.html here but it wasnt working
  expect(
    shallow(<DescriptionField description={actual} />)
      .html()
      .indexOf(shallow(markdown(actual)).html()) > 1
  ).toBe(true);
});
