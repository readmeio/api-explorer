const React = require('react');
const PropTypes = require('prop-types');

function CodeSampleResponseTabs(results) {
  if (results !== 'hub-reference-right hub-reference-results tabber-parent on') return null;

  return (
    <div>
      <ul className="code-sample-tabs hub-reference-results-header">
        <a href data-tab="result" className="hub-reference-results-header-item tabber-tab selected">
          <span>
            <i className="fa fa-circle" />
            <em />
          </span>
        </a>
        <a href data-tab="metadata" className="hub-reference-results-header-item tabber-tab">
          Metadata
        </a>
      </ul>
      <div className="tabber-body tabber-body-result" style="display: block">
        <pre className="tomorrow-night">{/* TODO add results.isBinary logic */}</pre>
      </div>
    </div>
  );
}

module.exports = CodeSampleResponseTabs;
