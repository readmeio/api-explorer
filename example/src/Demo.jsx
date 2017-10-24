const React = require('react');
const swagger2openapi = require('swagger2openapi');
const refParser = require('json-schema-ref-parser');
const extensions = require('../../packages/readme-oas-extensions/');

const createDocs = require('../../packages/api-explorer-ui/lib/create-docs');

const ApiExplorer = require('../../packages/api-explorer-ui/src/index');
const ApiList = require('./ApiList');

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { status: [], oas: {}, docs: [] };
    this.fetchSwagger = this.fetchSwagger.bind(this);
    this.convertSwagger = this.convertSwagger.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }
  updateStatus(status, next) {
    this.setState(prev => ({ status: [...prev.status, status] }), next);
  }
  fetchSwagger(url) {
    this.updateStatus('Fetching swagger file', () => {
      fetch(url)
        .then(res => res.json())
        .then(this.convertSwagger);
    });
  }
  convertSwagger(swagger) {
    this.updateStatus('Converting swagger file to OAS 3', () => {
      swagger2openapi.convertObj(swagger, {})
        .then((result) => {
          const oas = result.openapi;
          this.createDocs(oas);

          this.updateStatus('Dereferencing swagger file', async () => {
            this.setState({ oas: await refParser.dereference(oas) });
            this.updateStatus('Done!', () => {
              setTimeout(() => {
                this.setState({ status: [] });
              }, 1000);
            });
          });
        });
    });
  }
  createDocs(oas) {
    this.setState({ docs: createDocs(oas, 'api-setting') });
  }
  render() {
    return (
      <div>
        <div className="api-list-header">
          <ApiList fetchSwagger={this.fetchSwagger} />
          <pre>{this.state.status.join('\n')}</pre>
        </div>
        {
          this.state.status.length === 0 && (
            <ApiExplorer
              docs={this.state.docs}
              oasFiles={{
                'api-setting': Object.assign(extensions.defaults, this.state.oas),
              }}
              flags={{ correctnewlines: false }}
            />
          )
        }
      </div>
    );
  }
}

module.exports = Demo;
