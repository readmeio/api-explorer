const React = require('react');
const PropTypes = require('prop-types');

const Doc = require('./Doc');

function ApiExplorer({ docs, oasFiles }) {
  return (
    <div>
      {
        docs.map(doc => (
          <Doc
            key={doc._id}
            doc={doc}
            oas={doc.category.apiSetting ? oasFiles[doc.category.apiSetting] : {}}
          />
          ),
        )
      }
    </div>
  );
}

ApiExplorer.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.object).isRequired,
  oasFiles: PropTypes.shape({}).isRequired,
};

module.exports = ApiExplorer;
