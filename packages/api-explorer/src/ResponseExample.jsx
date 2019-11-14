const React = require('react');
const PropTypes = require('prop-types');
const ReactJson = require('react-json-view').default;
const syntaxHighlighter = require('@readme/syntax-highlighter');
const extensions = require('@readme/oas-extensions');
const Oas = require('oas');

const showCodeResults = require('./lib/show-code-results');
const contentTypeIsJson = require('./lib/content-type-is-json');
const upgradeLegacyResponses = require('./lib/upgrade-legacy-responses');

const ExampleTabs = require('./ExampleTabs');

const { Operation } = Oas;

function isDisplayable(example, responseExampleCopy) {
  if (!responseExampleCopy) return true;

  return example.label === responseExampleCopy;
}

function getReactJson(example, responseExampleCopy) {
  return (
    <ReactJson
      key={example.code}
      collapsed={2}
      collapseStringsAfterLength={100}
      displayDataTypes={false}
      displayObjectSize={false}
      enableClipboard={false}
      name={null}
      src={JSON.parse(example.code)}
      style={{
        padding: '20px 10px',
        backgroundColor: 'transparent',
        display: isDisplayable(example, responseExampleCopy) ? 'block' : 'none',
        fontSize: '12px',
      }}
      theme="tomorrow"
    />
  );
}

class ResponseExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exampleTab: 0,
      responseExample: null,
      responseMediaType: null,
      responseMediaTypeExample: null,
    };

    this.setExampleTab = this.setExampleTab.bind(this);
    this.setResponseExample = this.setResponseExample.bind(this);
    this.setResponseMediaType = this.setResponseMediaType.bind(this);
  }

  setExampleTab(index) {
    this.setState({
      exampleTab: index,
      responseExample: null,
      responseMediaType: null,
      responseMediaTypeExample: null,
    });
  }

  setResponseExample(index) {
    this.setState({ responseExample: index });
  }

  setResponseMediaType(example, index) {
    this.setState({
      responseMediaType: index,
      responseMediaTypeExample: example,
    });

    // Update the code sample.
    this.props.onChange({
      header: {
        Accept: example.language,
      },
    });
  }

  /**
   * Determine if we should render a dropdown of available media types for a given response example.
   *
   * @param {object} example
   * @param {string} responseMediaType
   * @param {boolean} [nestInTabberBarDivClass=false] If `true`, the dropdown will be rendered within
   *    a div that has the `tabber-bar` class.
   * @returns jsx
   */
  showMediaTypes(example, responseMediaType, nestInTabberBarDivClass = false) {
    const mediaTypes = example.languages;
    if (mediaTypes.length <= 1) return false;

    let responseMediaTypeCopy = responseMediaType;
    if (!responseMediaTypeCopy && mediaTypes[0]) responseMediaTypeCopy = mediaTypes[0].languages;

    return (
      <div className={nestInTabberBarDivClass ? 'tabber-bar' : ''}>
        <span className="tabber-select-row">
          <h3>Response Type</h3>
          <span className="tabber-select-wrapper">
            <select
              className="response-select"
              onChange={e => this.setResponseMediaType(mediaTypes[e.target.value], e.target.value)}
              value={responseMediaTypeCopy}
            >
              {mediaTypes.map((l, idx) => (
                <option key={l.language} value={idx}>
                  {l.language}
                </option>
              ))}
            </select>
          </span>
        </span>
      </div>
    );
  }

  showExamples(examples, mediaTypes, ex, responseMediaType) {
    const { responseExample } = this.state;
    let responseExampleCopy = responseExample;
    if (!responseExampleCopy && examples[0]) responseExampleCopy = examples[0].label;

    return (
      <div>
        <div className="tabber-bar">
          {mediaTypes.length > 1 && this.showMediaTypes(ex, responseMediaType)}

          <span className="tabber-select-row">
            <h3>Set an example</h3>
            <span className="select-wrapper">
              <select
                className="response-select"
                onChange={e => this.setResponseExample(e.target.value)}
                value={responseExampleCopy}
              >
                {examples.map(example => (
                  <option key={example.label} value={example.label}>
                    {example.label}
                  </option>
                ))}
              </select>
            </span>
          </span>
        </div>

        {examples.map(example => {
          return getReactJson(example, responseExampleCopy);
        })}
      </div>
    );
  }

  render() {
    const { operation, result, oas, exampleResponses } = this.props;
    const selectedTab = this.state.exampleTab;
    const { responseMediaType, responseMediaTypeExample } = this.state;

    let examples;
    if (exampleResponses.length) {
      // With https://github.com/readmeio/api-explorer/pull/312 we changed the shape of response
      // examples, but unfortunately APIs that are manually documented in ReadMe are still in the
      // legacy shape so we need to adhoc rewrite them to fit this new work.
      examples = upgradeLegacyResponses(exampleResponses);
    } else {
      examples = showCodeResults(operation, oas);
    }

    const hasExamples = examples.find(e => {
      return e.languages.find(ee => (ee.code && ee.code !== '{}') || 'multipleExamples' in ee);
    });

    return (
      <div className="hub-reference-results-examples code-sample">
        {examples && examples.length > 0 && hasExamples && (
          <span>
            <ExampleTabs
              examples={examples}
              selected={selectedTab}
              setExampleTab={this.setExampleTab}
            />

            <div className="code-sample-body">
              {examples.map((ex, index) => {
                let example;
                const mediaTypes = ex.languages;

                if (mediaTypes.length > 1) {
                  example = responseMediaTypeExample || mediaTypes[0];
                } else {
                  // eslint-disable-next-line prefer-destructuring
                  example = mediaTypes[0];
                }

                const isJson = example.language && contentTypeIsJson(example.language);

                const getHighlightedExample = hx => {
                  return syntaxHighlighter(hx.code, hx.language, {
                    dark: true,
                  });
                };

                const transformExampleIntoReactJson = rx => {
                  try {
                    return getReactJson(rx);
                  } catch (e) {
                    return getHighlightedExample(rx);
                  }
                };

                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={index}>
                    <pre
                      className={`tomorrow-night tabber-body tabber-body-${index}`}
                      style={{ display: index === selectedTab ? 'block' : '' }}
                    >
                      {!example.multipleExamples &&
                        this.showMediaTypes(ex, responseMediaType, true)}

                      {example.multipleExamples &&
                        this.showExamples(
                          example.multipleExamples,
                          mediaTypes,
                          ex,
                          responseMediaType,
                        )}

                      {isJson && !example.multipleExamples ? (
                        <div className="example example_json">
                          {transformExampleIntoReactJson(example)}
                        </div>
                      ) : (
                        // json + multiple examples is already handled in `showExamples`.
                        <div className="example">
                          {isJson && example.multipleExamples
                            ? null
                            : getHighlightedExample(example)}
                        </div>
                      )}
                    </pre>
                  </div>
                );
              })}
            </div>
          </span>
        )}

        {(examples.length === 0 || (!hasExamples && result === null)) && (
          <div className="hub-no-code">
            {oas[extensions.EXPLORER_ENABLED]
              ? 'Try the API to see Results'
              : 'No response examples available'}
          </div>
        )}
      </div>
    );
  }
}

ResponseExample.propTypes = {
  exampleResponses: PropTypes.arrayOf(PropTypes.shape({})),
  oas: PropTypes.instanceOf(Oas).isRequired,
  onChange: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  result: PropTypes.shape({}),
};

ResponseExample.defaultProps = {
  exampleResponses: [],
  result: {},
};

module.exports = ResponseExample;
