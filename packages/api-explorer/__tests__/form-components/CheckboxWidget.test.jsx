const React = require('react');
const { shallow } = require('enzyme');
const Checkbox = require('../../src/form-components/CheckboxWidget');

test('should not render description', () => {
  const checkbox = shallow(
    <Checkbox
      id="id"
      label="label"
      required
      onChange={() => {}}
      schema={{ description: 'description' }}
    />,
  );
  expect(checkbox.html()).not.toMatch(/description/);
});
