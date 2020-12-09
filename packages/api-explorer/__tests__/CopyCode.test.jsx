const React = require('react');
const { mount } = require('enzyme');

const CopyCode = require('../src/CopyCode');

const curl = `curl --request POST \
--url http://petstore.swagger.io/v2/pet \
--header 'Authorization: Bearer 123' \
--header 'Content-Type: application/json'`;

// `react-copy-to-clipboard` uses this when copying text to the clipboard so we need to mock it out or else we'll get
// errors in the test.
window.prompt = () => {};

test('should copy a snippet to the clipboard', () => {
  const onCopy = jest.fn();

  const node = mount(<CopyCode code={curl} onCopy={onCopy} />);

  node.find('button').simulate('click');

  expect(onCopy).toHaveBeenCalledWith(curl);
});

test('should update the code to copy when supplied with a new snippet', () => {
  const onCopy = jest.fn();

  const node = mount(<CopyCode code={curl} onCopy={onCopy} />);

  node.find('button').simulate('click');
  expect(onCopy).toHaveBeenCalledWith(curl);

  node.setProps({ code: 'console.log()' });

  node.find('button').simulate('click');
  expect(onCopy).toHaveBeenCalledWith('console.log()');
});
