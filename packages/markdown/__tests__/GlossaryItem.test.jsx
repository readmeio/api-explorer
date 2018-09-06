const React = require('react');
const { shallow } = require('enzyme');

const { GlossaryItem } = require('../GlossaryItem.jsx');

test('should output a glossary item if the term exists', () => {
  const term = 'acme';
  const definition = 'This is a definition';
  const glossaryItem = shallow(<GlossaryItem term={term} terms={[{ term, definition }]} />);

  expect(glossaryItem.find('.glossary-item.highlight').text()).toBe(term);
  expect(glossaryItem.find('.tooltip-content-body').text()).toBe(`- ${term} - ${definition}`);
});

test('should output nothing if the term does not exist', () => {
  expect(shallow(<GlossaryItem term="something" terms={[]} />).html()).toBe(null);
});
