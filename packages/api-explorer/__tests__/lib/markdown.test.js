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

describe('`stripHtml` option', () => {
  test('should allow html by default', () => {
    expect(markdown('<p>Test</p>')).toBe('<p><p>Test</p></p>\n');
    expect(markdown('<p>Test</p>', { stripHtml: false })).toBe('<p><p>Test</p></p>\n');
  });

  test('should escape unknown tags', () => {
    expect(markdown('<unknown-tag>Test</unknown-tag>')).toBe(
      '<p>&lt;unknown-tag&gt;Test&lt;/unknown-tag&gt;</p>\n',
    );
  });

  test('should allow certain attributes', () => {
    expect(markdown('<p id="test">Test</p>')).toBe('<p><p id="test">Test</p></p>\n');
  });

  test('should strip unknown attributes', () => {
    expect(markdown('<p unknown="test">Test</p>')).toBe('<p><p>Test</p></p>\n');
  });

  test('should escape everything if `stripHtml=true`', () => {
    expect(markdown('<p>Test</p>', { stripHtml: true })).toBe('<p>&lt;p&gt;Test&lt;/p&gt;</p>\n');
  });
});
