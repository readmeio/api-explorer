const React = require('react');
const PropTypes = require('prop-types');
const showCodeResults = require('./lib/show-code-results');
const classNames = require('classnames');
const IconStatus = require('./IconStatus');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

function ResponseTabs({ result, oas, operation, responseTab, setTab, hideResults }) {
  return (
    <ul className="code-sample-tabs hub-reference-results-header">
      {
        // eslint-disable-next-line jsx-a11y/href-no-hash
        <a
          href="#" // eslint eslint-disable-line jsx-a11y/href-no-hash
          data-tab="result"
          className={classNames('hub-reference-results-header-item tabber-tab', {
            selected: responseTab === 'result',
          })}
          onClick={e => {
            e.preventDefault();
            setTab('result');
          }}
        >
          <IconStatus status={result.status} />
        </a>
      }
      {
        // eslint-disable-next-line jsx-a11y/href-no-hash
        <a
          href="#"
          data-tab="metadata"
          className={classNames('hub-reference-results-header-item tabber-tab', {
            selected: responseTab === 'metadata',
          })}
          onClick={e => {
            e.preventDefault();
            setTab('metadata');
          }}
        >
          Metadata
        </a>
      }
      {showCodeResults(oas, operation).length > 0 && (
        // eslint-disable-next-line jsx-a11y/href-no-hash
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

module.exports = ResponseTabs;

ResponseTabs.propTypes = {
  result: PropTypes.shape({}),
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  responseTab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired,
  hideResults: PropTypes.func.isRequired,
};
ResponseTabs.defaultProps = {
  result: {},
};
