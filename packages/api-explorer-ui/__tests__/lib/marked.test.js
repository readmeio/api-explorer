const fs = require('fs');
const markdown = require('../../src/lib/markdown');

const fixture = fs.readFileSync(`${__dirname}/markdown.txt`, 'utf8');

test('should render markdown', () => {
  expect(markdown(fixture)).toMatchSnapshot();
});

test('should render empty string if nothing passed in', () => {
  expect(markdown('')).toBe('');
});

test('`correctnewlines` option', () => {
  expect(markdown('test\ntest\ntest', { correctnewlines: true })).toBe('<p>test\ntest\ntest</p>\n');
  expect(markdown('test\ntest\ntest', { correctnewlines: false })).toBe(
    '<p>test<br>test<br>test</p>\n',
  );
});

test('`stripHtml` option', () => {
  expect(markdown('<p>Test</p>')).toBe('<p><p>Test</p></p>\n');
  expect(markdown('<p>Test</p>', { stripHtml: false })).toBe('<p><p>Test</p></p>\n');
  expect(markdown('<p>Test</p>', { stripHtml: true })).toBe('<p>&lt;p&gt;Test&lt;/p&gt;</p>\n');
});
