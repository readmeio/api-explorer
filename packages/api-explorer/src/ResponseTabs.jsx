const React = require('react');
const PropTypes = require('prop-types');
const Oas = require('@readme/oas-tooling');

const showCodeResults = require('./lib/show-code-results');
const IconStatus = require('./IconStatus');
const Tab = require('./Tab');

const { Operation } = Oas;

function ResponseTabs({ result, oas, operation, responseTab, setTab, hideResults }) {
  return (
    <ul className="code-sample-tabs hub-reference-results-header">
      <Tab
        onClick={e => {
          e.preventDefault();
          setTab('result');
        }}
        selected={responseTab === 'result'}
      >
        <IconStatus status={result.status} />
      </Tab>

      <Tab
        onClick={e => {
          e.preventDefault();
          setTab('metadata');
        }}
        selected={responseTab === 'metadata'}
      >
        Metadata
      </Tab>

      {showCodeResults(operation, oas).length > 0 && (
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
  hideResults: PropTypes.func.isRequired,
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  responseTab: PropTypes.string.isRequired,
  result: PropTypes.shape({
    status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  setTab: PropTypes.func.isRequired,
};

ResponseTabs.defaultProps = {
  result: {},
};

module.exports = ResponseTabs;
