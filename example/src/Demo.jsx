const React = require('react');
const PropTypes = require('prop-types');
const { Flex, Toggle } = require('@readme/ui/.bundles/es/ui/components');

const extensions = require('../../packages/oas-extensions');

const withSpecFetching = require('./SpecFetcher');

const ApiExplorer = require('../../packages/api-explorer/src');
const Logs = require('../../packages/api-logs/index');
const ApiList = require('./ApiList');

require('../../packages/api-logs/main.css');

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brokenExplorerState: false,
      enableJsonEditor: true,
      enableTutorials: false,
      maskErrorMessages: false,
      useNewMarkdownEngine: true,
    };
  }

  experimentToggles() {
    const experiments = {
      'Mask error messages?': {
        description: 'Switch between our different error states: consumer and project/API owner.',
        stateProp: 'maskErrorMessages',
      },
      'Show fully broken state?': {
        description: "Send the Explorer into a broken state. You'll need to refresh the page to get it working again.",
        stateProp: 'brokenExplorerState',
      },
      'Use new Markdown engine?': {
        description: null,
        stateProp: 'useNewMarkdownEngine',
      },
      'Enable JSON editor (beta)': {
        description: 'Enable our request body JSON editor.',
        stateProp: 'enableJsonEditor',
      },
      'Enable tutorials (beta)': {
        description: 'Enable our tutorials beta.',
        stateProp: 'enableTutorials',
      },
    };

    return (
      <Flex className="api-experiments" justify="start">
        {Object.keys(experiments).map(name => {
          const experiment = experiments[name];

          return (
            <Toggle
              key={name}
              checked={this.state[experiment.stateProp]}
              label={name}
              name={name}
              onChange={e => {
                this.setState({ [experiment.stateProp]: e.target.checked });
                this.forceUpdate();
              }}
              size="md"
              type="toggle"
            />
          );
        })}
      </Flex>
    );
  }

  render() {
    const { fetchSwagger, status, docs, oas, oasUrl, oauth } = this.props;
    const {
      brokenExplorerState,
      enableJsonEditor,
      enableTutorials,
      maskErrorMessages,
      useNewMarkdownEngine,
    } = this.state;

    const additionalProps = {
      oasFiles: {
        'demo-api-setting': Object.assign(extensions.defaults, oas),
      },
      oasUrls: {
        'demo-api-setting': oasUrl,
      },
    };

    if (brokenExplorerState) {
      delete additionalProps.oasFiles;
    }

    if (enableTutorials) {
      docs.forEach((doc, i) => {
        docs[i].tutorials = [
          {
            title: 'Test Tutorial',
            description: 'Tutorial description',
            slug: 'test-tutorial',
            backgroundColor: '#018FF4',
            emoji: '🦉',
            _id: '123',
            response: '',
            steps: [
              {
                title: 'Step One',
                body: 'Step one description',
                lineNumbers: ['1'],
              },
              {
                title: 'Step Two',
                body: 'Step one description',
                lineNumbers: [],
              },
            ],
            snippet: {
              endpoint: {},
              codeOptions: [
                {
                  code: 'const r = "hello world";',
                  language: 'node',
                  highlightedSyntax: 'javascript',
                  name: 'Node',
                },
              ],
            },
          },
        ];
      });
    } else {
      docs.forEach((doc, i) => {
        docs[i].tutorials = [];
      });
    }

    return (
      <div>
        <div className="api-list-header">
          <ApiList fetchSwagger={fetchSwagger} />

          {status.length > 0 ? <pre>{status.join('\n')}</pre> : this.experimentToggles()}
        </div>

        {status.length === 0 && (
          <ApiExplorer
            {...additionalProps}
            // Uncomment this in for column layout
            // appearance={{ referenceLayout: 'column' }}
            appearance={{ referenceLayout: 'row' }}
            // Uncomment this if you want to test enterprise-structured URLs
            // baseUrl={'/child/v1.0'}
            baseUrl="/"
            // To test the top level error boundary, uncomment this
            // docs={[null, null]}
            docs={docs}
            // We only really set this to `true` for testing sites for errors using puppeteer
            dontLazyLoad={false}
            enableRequestBodyJsonEditor={enableJsonEditor}
            flags={{ correctnewlines: false }}
            glossaryTerms={[{ term: 'apiKey', definition: 'This is a definition' }]}
            Logs={Logs}
            maskErrorMessages={maskErrorMessages}
            oauth={oauth}
            onError={err => {
              // eslint-disable-next-line no-console
              console.error(err);
            }}
            suggestedEdits
            useNewMarkdownEngine={useNewMarkdownEngine}
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
                  { id: 'asdfghjkl', name: 'project1', apiKey: '123', user: 'user1', pass: 'pass1' },
                  { id: 'zxcvbnm', name: 'project2', apiKey: '456', user: 'user2', pass: 'pass2' },
                ],
              },
              defaults: [],
            }}
          />
        )}
      </div>
    );
  }
}

Demo.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.shape).isRequired,
  fetchSwagger: PropTypes.func.isRequired,
  oas: PropTypes.shape({}).isRequired,
  oasUrl: PropTypes.string.isRequired,
  oauth: PropTypes.bool,
  status: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Demo.defaultProps = {
  oauth: false,
};

module.exports = withSpecFetching(Demo);
