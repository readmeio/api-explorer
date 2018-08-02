const React = require('react');
const PropTypes = require('prop-types');

const GlossaryTermsContext = require('./contexts/GlossaryTerms');

// https://github.com/readmeio/api-explorer/blob/0dedafcf71102feedaa4145040d3f57d79d95752/packages/api-explorer/src/lib/replace-vars.js#L8
function GlossaryItem({ term, terms }) {
  const foundTerm = terms.find(i => term === i.term);

  if (!foundTerm) return null;

  return (
    <span className="glossary-tooltip" v={foundTerm.term}>
      <span className="glossary-item highlight">{foundTerm.term}</span>
      <span className="tooltip-content">
        <span className="tooltip-content-body">
          - <strong className="term">{foundTerm.term}</strong> - {foundTerm.definition}
        </span>
      </span>
    </span>
  );
}

GlossaryItem.propTypes = {
  term: PropTypes.string.isRequired,
  terms: PropTypes.arrayOf(
    PropTypes.shape({
      term: PropTypes.string.isRequired,
      definition: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

/* istanbul ignore next */
module.exports = props => (
  <GlossaryTermsContext.Consumer>
    {terms => <GlossaryItem {...props} terms={terms} />}
  </GlossaryTermsContext.Consumer>
);

module.exports.GlossaryItem = GlossaryItem;
