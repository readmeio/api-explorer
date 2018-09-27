const React = require('react');
const swagger2openapi = require('swagger2openapi');

const createDocs = require('../../packages/api-explorer/lib/create-docs');

function withSpecFetching(Component) {
  return class extends React.Component {
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
          .then((json) => {
            if (json.swagger) return this.convertSwagger(json);

            return this.dereference(json);
          }).catch((e) => {
            this.updateStatus(`There was an error fetching your specification:\n\n${e.message}`);
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
      return <Component {...this.state} {...this.props} fetchSwagger={this.fetchSwagger} />;
    }
  };
}

module.exports = withSpecFetching;
