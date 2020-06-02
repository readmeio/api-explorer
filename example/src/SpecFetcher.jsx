const React = require('react');
const swagger2openapi = require('swagger2openapi');
const swaggerParser = require('@apidevtools/swagger-parser');
const yaml = require('yaml');

const createDocs = require('../../packages/api-explorer/lib/create-docs');

function withSpecFetching(Component) {
  return class SpecFetcher extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        docs: [],
        failure: null,
        isLoading: false,
        oas: {},
        status: [],
      };

      this.fetchSwagger = this.fetchSwagger.bind(this);
      this.convertSwagger = this.convertSwagger.bind(this);
      this.updateStatus = this.updateStatus.bind(this);
    }

    updateStatus(status, next) {
      this.setState(prev => ({ status: [...prev.status, status] }), next);
    }

    fetchSwagger(url) {
      this.setState({ isLoading: true }, () => {
        this.updateStatus('Fetching API definition');
        fetch(url)
          .then(res => {
            if (!res.ok) {
              throw new Error('Failed to fetch');
            }

            if (res.headers.get('content-type') === 'application/yaml' || url.match(/\.(yaml|yml)/)) {
              this.updateStatus('Converting YAML to JSON');
              return res.text().then(text => {
                return yaml.parse(text);
              });
            }

            return res.json();
          })
          .then(json => {
            if (json.swagger) return this.convertSwagger(url, json);
            return json;
          })
          .then(json => {
            this.updateStatus('Validating the definition');
            return swaggerParser.validate(json);
          })
          .then(json => this.dereference(json))
          .catch(e => {
            this.setState({ isLoading: false });
            this.updateStatus(`There was an error handling your API definition:\n\n${e.message}`);
          });
      });
    }

    dereference(oas) {
      this.createDocs(oas);
      this.setState({ oas });
      this.updateStatus('Done!', () => {
        setTimeout(() => {
          this.setState({ isLoading: false, status: [] });
        }, 1000);
      });
    }

    convertSwagger(url, swagger) {
      this.updateStatus('Converting Swagger to OpenAPI 3');

      return swagger2openapi
        .convertObj(swagger, { patch: true })
        .then(({ openapi }) => openapi)
        .catch(e => {
          this.setState({ isLoading: false, invalidSpec: e.message, invalidSpecPath: url });
          this.updateStatus(`There was an error converting your API definition:\n\n${e.message}`);
        });
    }

    createDocs(oas) {
      this.setState({ docs: createDocs(oas, 'api-setting') });
    }

    render() {
      return <Component {...this.state} {...this.props} fetchSwagger={this.fetchSwagger} />;
    }
  };
}

module.exports = withSpecFetching;
