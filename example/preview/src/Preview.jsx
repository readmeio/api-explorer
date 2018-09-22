const React = require('react');
const swagger2openapi = require('swagger2openapi');
const PropTypes = require('prop-types');
const extensions = require('../../../packages/oas-extensions/');

const createDocs = require('../../../packages/api-explorer/lib/create-docs');

const ApiExplorer = require('../../../packages/api-explorer/src');

require('../../../packages/api-explorer/api-explorer.css');

class Preview extends React.Component {
  constructor(props) {
    super(props);
    this.state = { status: [], oas: {}, docs: [] };
    this.fetchSwagger = this.fetchSwagger.bind(this);
    this.convertSwagger = this.convertSwagger.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }
  componentDidMount() {
    const searchParams = new URLSearchParams(window.location.search);
    this.fetchSwagger(searchParams.get('url') || '../swagger-files/petstore.json');
  }
  updateStatus(status, next) {
    this.setState(prev => ({ status: [...prev.status, status] }), next);
  }
  fetchSwagger(url) {
    this.updateStatus('Fetching swagger file', () => {
      fetch(url)
        .then(res => res.json())
        .then((json) => {
          if (json.swagger) return this.convertSwagger(json);

          return this.dereference(json);
        });
    });
  }
  dereference(oas) {
    this.createDocs(oas);
    this.setState({ oas });
    this.updateStatus('Done!', () => {
      setTimeout(() => {
        this.setState({ status: [] });
      }, 1000);
    });
  }
  convertSwagger(swagger) {
    this.updateStatus('Converting swagger file to OAS 3', () => {
      swagger2openapi.convertObj(swagger, {})
        .then(({ openapi }) => this.dereference(openapi));
    });
  }
  createDocs(oas) {
    this.setState({ docs: createDocs(oas, 'api-setting') });
  }
  render() {
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

        { this.state.status.length ? <pre style={{ marginLeft: '20px' }}>{this.state.status.join('\n')}</pre> : null }
        {
          this.state.status.length === 0 && (
            <ApiExplorer
              // // To test the top level error boundary, uncomment this
              // docs={[null, null]}
              docs={this.state.docs}
              oasFiles={{
                'api-setting': Object.assign(extensions.defaults, this.state.oas),
              }}
              flags={{ correctnewlines: false }}
              // Uncomment this in for column layout
              // appearance={{ referenceLayout: 'column' }}
              appearance={{ referenceLayout: 'row' }}
              suggestedEdits
              oauth={this.props.oauth}
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
};

Preview.defaultProps = {
  oauth: false,
};
module.exports = Preview;
