const React = require('react');
const PropTypes = require('prop-types');
const IconStatus = require('./IconStatus');
const Tab = require('./Tab');

function ExampleTabs({ examples, selected, setExampleTab }) {
  return (
    <ul className="code-sample-tabs hub-reference-results-header">
      {examples.map((example, index) => {
        return (
          <Tab
            selected={index === selected}
            onClick={e => {
              e.preventDefault();
              setExampleTab(index);
            }}
            key={index} // eslint-disable-line react/no-array-index-key
          >
            <IconStatus status={example.status} name={example.name} />
          </Tab>
        );
      })}
    </ul>
  );
}
module.exports = ExampleTabs;

ExampleTabs.propTypes = {
  examples: PropTypes.arrayOf(PropTypes.shape({
    status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string
  })).isRequired,
  selected: PropTypes.number.isRequired,
  setExampleTab: PropTypes.func.isRequired,
};
