const React = require('react');
const PropTypes = require('prop-types');
const showCodeResults = require('./lib/show-code-results');
const IconStatus = require('./IconStatus');
const Tab = require('./Tab');
const { Operation } = require('./lib/Oas');

function ResponseTabs({ result, operation, responseTab, setTab, hideResults }) {
  return (
    <ul className="code-sample-tabs hub-reference-results-header">
      <Tab
        selected={responseTab === 'result'}
        onClick={e => {
          e.preventDefault();
          setTab('result');
        }}
      >
        <IconStatus status={result.status} />
      </Tab>

      <Tab
        selected={responseTab === 'metadata'}
        onClick={e => {
          e.preventDefault();
          setTab('metadata');
        }}
      >
        Metadata
      </Tab>

      {showCodeResults(operation).length > 0 && (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
          className="hub-reference-results-back pull-right"
          href="#"
          onClick={e => {
            e.preventDefault();
            hideResults();
          }}
        >
          <span className="fa fa-chevron-circle-left"> to examples </span>
        </a>
      )}
    </ul>
  );
}

ResponseTabs.propTypes = {
  result: PropTypes.shape({
    status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  operation: PropTypes.instanceOf(Operation).isRequired,
  responseTab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired,
  hideResults: PropTypes.func.isRequired,
};

ResponseTabs.defaultProps = {
  result: {},
};

module.exports = ResponseTabs;
