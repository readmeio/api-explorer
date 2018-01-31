const React = require('react');
const PropTypes = require('prop-types');
const showCodeResults = require('./lib/show-code-results');
const IconStatus = require('./IconStatus');
const Tab = require('./Tab');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

function ExampleTabs({ operation, selected, setExampleTab }) {
  return (
    <ul className="code-sample-tabs hub-reference-results-header">
      {showCodeResults(operation).map((example, index) => {
        return (
          <Tab
            selected={index === selected}
            onClick={e => {
              e.preventDefault();
              setExampleTab(index);
            }}
            key={index} // eslint-disable-line react/no-array-index-key
          >
            <IconStatus status={example.status} />
          </Tab>
        );
      })}
    </ul>
  );
}
module.exports = ExampleTabs;

ExampleTabs.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
  selected: PropTypes.number.isRequired,
  setExampleTab: PropTypes.func.isRequired,
};
