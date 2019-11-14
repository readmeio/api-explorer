const React = require('react');
const PropTypes = require('prop-types');

const extensions = require('../../packages/oas-extensions/');

const withSpecFetching = require('./SpecFetcher');

const ApiExplorer = require('../../packages/api-explorer/src');
const Logs = require('../../packages/api-logs/index');
const ApiList = require('./ApiList');

require('../../example/swagger-files/types.json');
require('../../example/swagger-files/response-schemas.json');

require('../../packages/api-logs/main.css');

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
            // To test the top level error boundary, uncomment this
            // docs={[null, null]}
            docs={docs}
            oasFiles={{
              'api-setting': Object.assign(extensions.defaults, oas),
            }}
            baseUrl="/"
            // Uncomment this if you want to test enterprise-structured URLs
            // baseUrl={'/child/v1.0'}
            Logs={Logs}

            // We only really set this to `true` for testing sites for errors using puppeteer
            dontLazyLoad={false}

            flags={{ correctnewlines: false }}
            // Uncomment this in for column layout
            // appearance={{ referenceLayout: 'column' }}
            appearance={{ referenceLayout: 'row' }}
            suggestedEdits
            oauth={oauth}
            variables={{
              // Uncomment this to test without logs
              // user: {}
              // Uncomment this to test with logs
              // user: {
              //   keys: [
              //     { id: 'someid', name: 'project1', apiKey: '123' },
              //     { id: 'anotherid', name: 'project2', apiKey: '456' },
              //   ],
              // },
              // Uncomment this to test without keys array
              // user: { user: '123456', pass: 'abc', apiKey: '123456' },
              user: {
                keys: [
                  { name: 'project1', apiKey: '123', user: 'user1', pass: 'pass1' },
                  { name: 'project2', apiKey: '456', user: 'user2', pass: 'pass2' }
                ]
              },
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
