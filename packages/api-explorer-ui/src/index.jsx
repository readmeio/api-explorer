const React = require('react');

const Doc = require('./Doc.jsx');

module.exports = ({ docs, oasFiles }) => {
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
};
