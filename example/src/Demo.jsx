const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('../../packages/oas-extensions/');

const withSpecFetching = require('./SpecFetcher');

const ApiExplorer = require('../../packages/api-explorer/src');
const ApiList = require('./ApiList');

require('../../example/swagger-files/types.json');
require('../../packages/api-explorer/api-explorer.css');

function Demo({ fetchSwagger, status, docs, oas, oauth }) {
  return (
    <div>
      <div className="api-list-header">
        <ApiList fetchSwagger={fetchSwagger} />
        <pre>{status.join('\n')}</pre>
      </div>
      {
        status.length === 0 && (
          <ApiExplorer
            // // To test the top level error boundary, uncomment this
            // docs={[null, null]}
            docs={docs}
            oasFiles={{
              'api-setting': Object.assign(extensions.defaults, oas),
            }}
            flags={{ correctnewlines: false }}
            // Uncomment this in for column layout
            // appearance={{ referenceLayout: 'column' }}
            appearance={{ referenceLayout: 'row' }}
            suggestedEdits
            oauth={oauth}
            variables={{
              user: { keys: [{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }] },
              defaults: [],
            }}
            glossaryTerms={[{ term: 'apiKey', definition: 'This is a definition' }]}
          />
        )
      }
    </div>
  );
}

Demo.propTypes = {
  oauth: PropTypes.bool,
  oas: PropTypes.shape({}).isRequired,
  docs: PropTypes.arrayOf(PropTypes.shape).isRequired,
  status: PropTypes.arrayOf(PropTypes.string).isRequired,
  fetchSwagger: PropTypes.func.isRequired,
};

Demo.defaultProps = {
  oauth: false,
};

module.exports = withSpecFetching(Demo);
