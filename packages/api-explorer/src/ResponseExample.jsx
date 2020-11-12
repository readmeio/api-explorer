const React = require('react');
const PropTypes = require('prop-types');
const ReactJson = require('react-json-view').default;
const syntaxHighlighter = require('@readme/syntax-highlighter/dist/index.js').default;
const extensions = require('@readme/oas-extensions');
const Oas = require('oas/tooling');
const { matchesMimeType } = require('oas/tooling/utils');

const upgradeLegacyResponses = require('./lib/upgrade-legacy-responses');

const ExampleTabs = require('./ExampleTabs');

const { Operation } = Oas;

function isDisplayable(example, current) {
  if (!current) return true;

  return example.label === current;
}

function getReactJson(example, current) {
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
        display: isDisplayable(example, current) ? 'block' : 'none',
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
      currentExample: null,
      currentTab: 0,
      responseExamples: [],
      responseMediaType: null,
      responseMediaTypeExample: null,
    };

    this.setCurrentTab = this.setCurrentTab.bind(this);
    this.setResponseExample = this.setResponseExample.bind(this);
    this.setResponseMediaType = this.setResponseMediaType.bind(this);
  }

  componentDidMount() {
    const { operation } = this.props;

    operation.getResponseExamples().then(examples => {
      this.setState({
        responseExamples: examples || [],
      });
    });
  }

  setCurrentTab(index) {
    this.setState({
      currentExample: null,
      currentTab: index,
      responseMediaType: null,
      responseMediaTypeExample: null,
    });
  }

  setResponseExample(index) {
    this.setState({ currentExample: index });
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

  showExamples(language, isJSON, examples, mediaTypes, ex, responseMediaType) {
    const { currentExample } = this.state;
    let current = currentExample;
    if (!current && examples[0]) current = examples[0].label;

    return (
      <div>
        <div className="tabber-bar">
          {mediaTypes.length > 1 && this.showMediaTypes(ex, responseMediaType)}

          <span className="tabber-select-row">
            <h3>Choose an example</h3>
            <span className="select-wrapper">
              <select
                className="response-select"
                onChange={e => this.setResponseExample(e.target.value)}
                value={current}
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

        {examples.map((example, index) => {
          try {
            if (!isJSON) {
              // This example isn't for a JSON content type so we shouldn't bother trying to feed it into
              // `getReactJSON`.
              throw Error;
            }

            return (
              <div key={index} className="example example_json">
                {getReactJson(example, current)}
              </div>
            );
          } catch (e) {
            return (
              <div key={index} className="example">
                <div style={{ display: isDisplayable(example, current) ? 'block' : 'none' }}>
                  {syntaxHighlighter(example.code, language, {
                    dark: true,
                  })}
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  }

  render() {
    const { operation, result, oas, exampleResponses } = this.props;
    const { currentTab, responseExamples, responseMediaType, responseMediaTypeExample } = this.state;
    const explorerEnabled = extensions.getExtension(extensions.EXPLORER_ENABLED, oas, operation);

    let examples;
    if (exampleResponses.length) {
      // With https://github.com/readmeio/api-explorer/pull/312 we changed the shape of response
      // examples, but unfortunately APIs that are manually documented in ReadMe are still in the
      // legacy shape so we need to adhoc rewrite them to fit this new work.
      examples = upgradeLegacyResponses(exampleResponses);
    } else {
      examples = responseExamples;
    }

    const hasExamples = examples.find(e => {
      return e.languages.find(ee => (ee.code && ee.code !== '{}') || 'multipleExamples' in ee);
    });

    const getHighlightedExample = hx => {
      return (
        <div className="example">
          {syntaxHighlighter(hx.code, hx.language, {
            dark: true,
          })}
        </div>
      );
    };

    const transformExampleIntoReactJson = rx => {
      try {
        return <div className="example example_json">{getReactJson(rx)}</div>;
      } catch (e) {
        return getHighlightedExample(rx);
      }
    };

    return (
      <div className="hub-reference-results-examples code-sample">
        {examples && examples.length > 0 && hasExamples && (
          <span>
            <ExampleTabs examples={examples} selected={currentTab} setCurrentTab={this.setCurrentTab} />

            <div className="code-sample-body">
              {examples.map((ex, index) => {
                let example;
                const mediaTypes = ex.languages;

                if (mediaTypes.length > 1) {
                  example = responseMediaTypeExample || mediaTypes[0];
                } else {
                  example = mediaTypes[0];
                }

                const isJson =
                  example.language &&
                  (matchesMimeType.json(example.language) || matchesMimeType.wildcard(example.language));

                return (
                  <div key={index}>
                    <pre
                      className={`tomorrow-night tabber-body tabber-body-${index}`}
                      style={{ display: index === currentTab ? 'block' : '' }}
                    >
                      {!example.multipleExamples && this.showMediaTypes(ex, responseMediaType, true)}

                      {example.multipleExamples &&
                        this.showExamples(
                          example.language,
                          isJson,
                          example.multipleExamples,
                          mediaTypes,
                          ex,
                          responseMediaType
                        )}

                      {isJson && !example.multipleExamples ? (
                        transformExampleIntoReactJson(example)
                      ) : (
                        // json + multiple examples is already handled in `showExamples`.
                        <React.Fragment>
                          {isJson && example.multipleExamples ? null : getHighlightedExample(example)}
                        </React.Fragment>
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
            {explorerEnabled ? 'Try the API to see Results' : 'No response examples available'}
          </div>
        )}
      </div>
    );
  }
}

ResponseExample.propTypes = {
  exampleResponses: PropTypes.arrayOf(PropTypes.shape({})),
  explorerEnabled: PropTypes.bool,
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
