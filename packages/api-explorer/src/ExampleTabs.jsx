const React = require('react');
const PropTypes = require('prop-types');
const IconStatus = require('./IconStatus');
const Tab = require('./Tab');

function ExampleTabs({ examples, selected, setCurrentTab }) {
  return (
    <ul className="code-sample-tabs hub-reference-results-header">
      {examples.map((example, index) => {
        return (
          <Tab
            key={index}
            onClick={e => {
              e.preventDefault();
              setCurrentTab(index);
            }}
            selected={index === selected}
          >
            <IconStatus status={example.status} />
          </Tab>
        );
      })}
    </ul>
  );
}

ExampleTabs.propTypes = {
  examples: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selected: PropTypes.number.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
};

module.exports = ExampleTabs;
