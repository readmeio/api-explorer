const React = require('react');
const PropTypes = require('prop-types');
const ReactJson = require('react-json-view').default;
const showCodeResults = require('./lib/show-code-results');
const contentTypeIsJson = require('./lib/content-type-is-json');

const syntaxHighlighter = require('@readme/syntax-highlighter');
const extensions = require('@readme/oas-extensions');

const ExampleTabs = require('./ExampleTabs');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

function isDisplayable(example, responseExampleCopy) {
  if (!responseExampleCopy) return true;

  return example.label === responseExampleCopy;
}

function getReactJson(example, responseExampleCopy) {
  return (
    <ReactJson
      src={JSON.parse(example.code)}
      collapsed={2}
      collapseStringsAfterLength={100}
      enableClipboard={false}
      theme="tomorrow"
      name={null}
      displayDataTypes={false}
      displayObjectSize={false}
      key={example.code}
      style={{
        padding: '20px 10px',
        backgroundColor: 'transparent',
        display: isDisplayable(example, responseExampleCopy) ? 'block' : 'none',
        fontSize: '12px',
      }}
    />
  );
}

function showMediaTypes(example, setResponseMediaType, responseMediaType) {
  const mediaTypes = example.languages;
  if (mediaTypes.length <= 1) {
    return false;
  }

  let responseMediaTypeCopy = responseMediaType;
  if (!responseMediaTypeCopy && mediaTypes[0]) responseMediaTypeCopy = mediaTypes[0].languages;

  return (
    <div>
      <span className="tabber-select-row">
        <h3>Media Types</h3>
        <select
          className="response-select"
          onChange={e => setResponseMediaType(mediaTypes[e.target.value], e.target.value)}
          value={responseMediaTypeCopy}
        >
          {mediaTypes.map((l, idx) => (
            <option value={idx} key={l.language}>
              {l.language}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
}

function showExamples(
  examples,
  setResponseExample,
  responseExample,
  mediaTypes,
  ex,
  setResponseMediaType,
  responseMediaType,
) {
  let responseExampleCopy = responseExample;
  if (!responseExampleCopy && examples[0]) responseExampleCopy = examples[0].label;

  return (
    <div>
      <div className="tabber-bar">
        {mediaTypes.length > 1 && showMediaTypes(ex, setResponseMediaType, responseMediaType)}
        <span className="tabber-select-row">
          <h3>Examples</h3>
          <select
            className="response-select"
            onChange={e => setResponseExample(e.target.value)}
            value={responseExampleCopy}
          >
            {examples.map(example => (
              <option value={example.label} key={example.label}>
                {example.label}
              </option>
            ))}
          </select>
        </span>
      </div>
      {examples.map(example => {
        return getReactJson(example, responseExampleCopy);
      })}
    </div>
  );
}

function Example({
  operation,
  result,
  oas,
  selected,
  setExampleTab,
  exampleResponses,
  setResponseExample,
  setResponseMediaType,
  responseExample,
  responseMediaType,
  responseMediaTypeExample,
}) {
  const examples = exampleResponses.length ? exampleResponses : showCodeResults(operation);
  // @fixme this doesn't seem to pick up results if there is just one example?
  const hasExamples = examples.find(e => {
    return e.languages.find(ee => ee.code && ee.code !== '{}');
  });

  return (
    <div className="hub-reference-results-examples code-sample">
      {examples && examples.length > 0 && hasExamples && (
        <span>
          <ExampleTabs examples={examples} selected={selected} setExampleTab={setExampleTab} />
          <div className="code-sample-body">
            {examples.map((ex, index) => {
              let example;
              let isJson;
              const mediaTypes = ex.languages;

              if (mediaTypes.length > 1) {
                example = responseMediaTypeExample || mediaTypes[0];
                isJson = example.language && contentTypeIsJson(example.language);
              } else {
                example = mediaTypes[0];
                isJson = example.language && contentTypeIsJson(example.language);
              }

              const getHighlightedExample = exx => {
                return syntaxHighlighter(exx.code, exx.language, {
                  dark: true,
                });
              };

              const transformExampleIntoReactJson = exx => {
                try {
                  return getReactJson(exx);
                } catch (e) {
                  return getHighlightedExample(exx);
                }
              };

              return (
                <div>
                  <pre
                    className={`tomorrow-night tabber-body tabber-body-${index}`}
                    style={{ display: index === selected ? 'block' : '' }}
                    key={index} // eslint-disable-line react/no-array-index-key
                  >
                    {!example.multipleExamples && (
                      <div className="tabber-bar">
                        {showMediaTypes(ex, setResponseMediaType, responseMediaType)}
                      </div>
                    )}

                    {example.multipleExamples &&
                      showExamples(
                        example.multipleExamples,
                        setResponseExample,
                        responseExample,
                        mediaTypes,
                        ex,
                        setResponseMediaType,
                        responseMediaType,
                      )}

                    {isJson && !example.multipleExamples ? (
                      <div className="example example_json">
                        {transformExampleIntoReactJson(example)}
                      </div>
                    ) : (
                      // json + multiple examples is already handled in `showExamples`.
                      <div className="example">
                        {isJson && example.multipleExamples ? null : getHighlightedExample(example)}
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

module.exports = Example;

Example.propTypes = {
  result: PropTypes.shape({}),
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  selected: PropTypes.number.isRequired,
  responseExample: PropTypes.string,
  responseMediaType: PropTypes.string,
  responseMediaTypeExample: PropTypes.shape({}),
  setExampleTab: PropTypes.func.isRequired,
  setResponseExample: PropTypes.func.isRequired,
  setResponseMediaType: PropTypes.func.isRequired,
  exampleResponses: PropTypes.arrayOf(PropTypes.shape({})),
};

Example.defaultProps = {
  result: {},
  responseExample: null,
  responseMediaType: null,
  responseMediaTypeExample: null,
  exampleResponses: [],
};
