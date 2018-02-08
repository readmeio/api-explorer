const React = require('react');
const { shallow } = require('enzyme');
const Checkbox = require('../../src/form-components/CheckboxWidget');

test('should not render description', () => {
  const props = {
    label: 'test',
  };
  const checkbox = shallow(<Checkbox props={props} />);
  expect(checkbox.render().html()).toMatchSnapshot();
});
