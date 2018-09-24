const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('../../../packages/oas-extensions/');

const ApiExplorer = require('../../../packages/api-explorer/src');
const withSpecFetching = require('../../src/SpecFetcher');

require('../../../packages/api-explorer/api-explorer.css');

class Preview extends React.Component {
  componentDidMount() {
    const searchParams = new URLSearchParams(window.location.search);
    this.props.fetchSwagger(searchParams.get('url') || '../swagger-files/petstore.json');
  }
  render() {
    const { status, docs, oas, oauth } = this.props;

    return (
      <div>
        <div id="hub-reference">
          <div className="hub-reference">
            <div className="hub-reference-section">
              <div className="hub-reference-left">
                <div className="hub-preview">
                  <div className="hub-preview-owlbert" /><i className="icon icon-readme" />
                  <p><strong>Like what you see?</strong> ReadMe makes it easy to create beautiful documentation for your API! You can import a Swagger/OAS file&hellip; but that&apos;s not all! ReadMe also helps you build a community, document non-API references and much more! Sign up now to get awesome docs for your Swagger file!</p><a className="btn btn-primary btn-lg" href="https://dash.readme.io/signup">Sign Up for ReadMe</a>
                </div>
              </div>
              <div className="hub-reference-right">&nbsp;</div>
            </div>
          </div>
        </div>

        { status.length ? <pre style={{ marginLeft: '20px' }}>{status.join('\n')}</pre> : null }
        {
          status.length === 0 && (
            <ApiExplorer
              docs={docs}
              oasFiles={{
                'api-setting': Object.assign(extensions.defaults, oas),
              }}
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
}

Preview.propTypes = {
  oauth: PropTypes.bool,
  oas: PropTypes.shape({}).isRequired,
  docs: PropTypes.arrayOf(PropTypes.shape).isRequired,
  status: PropTypes.arrayOf(PropTypes.string).isRequired,
  fetchSwagger: PropTypes.func.isRequired,
};

Preview.defaultProps = {
  oauth: false,
};

module.exports = withSpecFetching(Preview);
