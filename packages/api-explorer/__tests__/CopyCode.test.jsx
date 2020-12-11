const React = require('react');
const { render, fireEvent, screen } = require('@testing-library/react');

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

  render(<CopyCode code={curl} onCopy={onCopy} />);

  fireEvent.click(screen.getByRole('button'));

  expect(onCopy).toHaveBeenCalledWith(curl);
});

test('should update the code to copy when supplied with a new snippet', () => {
  const onCopy = jest.fn();

  const { rerender } = render(<CopyCode code={curl} onCopy={onCopy} />);

  fireEvent.click(screen.getByRole('button'));
  expect(onCopy).toHaveBeenCalledWith(curl);

  rerender(<CopyCode code={curl} onCopy={onCopy} />);

  rerender(<CopyCode code='fetch("https://example.com")' onCopy={onCopy} />);

  fireEvent.click(screen.getByRole('button'));
  expect(onCopy).toHaveBeenCalledWith('fetch("https://example.com")');
});
