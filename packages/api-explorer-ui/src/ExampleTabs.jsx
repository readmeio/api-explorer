const React = require('react');
const PropTypes = require('prop-types');
const showCodeResults = require('./lib/show-code-results');
const statusCodes = require('./lib/statuscodes');
const { getLangName } = require('./lib/generate-code-snippet');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

function ExampleTabs({ operation, exampleTab, setExampleTab }) {
  return (
    <ul className="code-sample-tabs hub-reference-results-header">
      {showCodeResults(operation).map((example, index) => {
        const status = statusCodes(example.status);
        const title = example.name ? example.name : status[1];

        return (
          // eslint-disable-next-line jsx-a11y/href-no-hash
          <a
            className={
              index === exampleTab ? (
                'hub-reference-results-header-item tabber-tab selected'
              ) : (
                'hub-reference-results-header-item tabber-tab '
              )
            }
            href="#"
            data-tab={index}
            key={index} // eslint-disable-line react/no-array-index-key
            onClick={e => {
              e.preventDefault();
              setExampleTab(index);
            }}
          >
            {example.status ? (
              <span className={status[2] === 'success' ? 'httpsuccess' : 'httperror'}>
                <i className="fa fa-circle" />
                <em>
                  &nbsp;{status[0]}&nbsp;{title}
                </em>
              </span>
            ) : (
              <span>{getLangName(example.language)}</span>
            )}
          </a>
        );
      })}
    </ul>
  );
}
module.exports = ExampleTabs;

ExampleTabs.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
  exampleTab: PropTypes.string.isRequired,
  setExampleTab: PropTypes.func.isRequired,
};
