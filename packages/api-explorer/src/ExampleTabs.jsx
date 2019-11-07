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
            key={index} // eslint-disable-line react/no-array-index-key
            onClick={e => {
              e.preventDefault();
              setExampleTab(index);
            }}
            selected={index === selected}
          >
            <IconStatus name={example.name} status={example.status} />
          </Tab>
        );
      })}
    </ul>
  );
}

ExampleTabs.propTypes = {
  examples: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selected: PropTypes.number.isRequired,
  setExampleTab: PropTypes.func.isRequired,
};

module.exports = ExampleTabs;
