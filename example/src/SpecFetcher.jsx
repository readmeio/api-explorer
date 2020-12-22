const React = require('react');
const swagger2openapi = require('swagger2openapi');
const swaggerParser = require('@apidevtools/swagger-parser');
const yaml = require('yaml');

const createDocs = require('../../packages/api-explorer/__tests__/__fixtures__/create-docs');

function withSpecFetching(Component) {
  return class SpecFetcher extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        appearance: {},
        docs: [],
        failure: null,
        flags: {},
        isLoading: false,
        oas: {},
        oasFiles: {},
        oasUrl: '',
        oasUrls: {},
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
      this.setState({ isLoading: true }, async () => {
        this.updateStatus('Fetching API definition');

        const json = await fetch(url).then(res => {
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
        });

        if (json.readmeManual) {
          this.setState({
            appearance: json.appearance || {},
            flags: json.flags || {},
            docs: json.docs,
            oasFiles: json.oasFiles,
            oasUrls: json.oasUrls || {},
          });

          this.updateStatus('Done!', () => {
            setTimeout(() => {
              this.setState({ isLoading: false, status: [] });
            }, 1000);
          });

          return;
        }

        await new Promise(resolve => {
          if (json.swagger) {
            resolve(this.convertSwagger(url, json));
          } else {
            resolve(json);
          }
        })
          .then(async oas => {
            this.updateStatus('Validating the definition');

            // If the definition isn't valid, errors will be thrown automatically. We're stringifying the JSON to a
            // copy because the swagger-parser validate method turns circular refs into `[Circular]` objects that then
            // in turn wreak havoc on some JSON Schema parsing further down in the explorer. This is a hack, and this
            // definitely isn't the best way to handle this, but for the purposes of the example site it's alright.
            const copy = JSON.stringify(oas);
            await swaggerParser.validate(oas);

            return JSON.parse(copy);
          })
          .then(oas => {
            let oasUrl = url;
            if (url.indexOf('http') < 0) {
              // Ensure that our fixtures from `example/swagger-files` have a publically addressible URL when they're
              // placed inside code snippets.
              oasUrl = `${window.location.origin}/${url}`;
            }

            this.createDocs(oas);
            this.setState({ oas, oasUrl });

            // eslint-disable-next-line sonarjs/no-identical-functions
            this.updateStatus('Done!', () => {
              setTimeout(() => {
                this.setState({ isLoading: false, status: [] });
              }, 1000);
            });
          })
          .catch(e => {
            this.setState({ isLoading: false });
            this.updateStatus(`There was an error handling your API definition:\n\n${e.message}`);
          });
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
      this.setState({ docs: createDocs(oas, 'demo-api-setting') });
    }

    render() {
      return <Component {...this.state} {...this.props} fetchSwagger={this.fetchSwagger} />;
    }
  };
}

module.exports = withSpecFetching;
