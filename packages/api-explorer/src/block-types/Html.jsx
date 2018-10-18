const React = require('react');
const PropTypes = require('prop-types');
const { VariablesContext, replaceVars } = require('@readme/variable');
const { GlossaryTermsContext } = require('@readme/markdown');

const Html = ({ block }) => {
  return (
    <VariablesContext.Consumer>
      {({ user, defaults }) => (
        <GlossaryTermsContext.Consumer>
          {glossaryTerms => (
            <div
              className="magic-block-html"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: replaceVars(user, defaults, glossaryTerms, block.data.html),
              }}
            />
          )}
        </GlossaryTermsContext.Consumer>
      )}
    </VariablesContext.Consumer>
  );
};

Html.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      html: PropTypes.string.isRequired,
    }),
  }).isRequired,
};
module.exports = Html;
