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

function isDisplayable(example, responseTypeCopy) {
  if (!responseTypeCopy) return true;

  return example.label === responseTypeCopy;
}

function getReactJson(example, responseTypeCopy) {
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
        display: isDisplayable(example, responseTypeCopy) ? 'block' : 'none',
        fontSize: '12px',
      }}
    />
  );
}

function showExamples(examples, setResponseType, responseType) {
  let responseTypeCopy = responseType;
  if (!responseTypeCopy && examples[0]) responseTypeCopy = examples[0].label;

  return (
    <div>
      {examples.length > 1 && (
        <select
          className="response-select"
          onChange={e => setResponseType(e.target.value)}
          value={responseTypeCopy}
        >
          {examples.map(example => (
            <option value={example.label} key={example.label}>
              {example.label}
            </option>
          ))}
        </select>
      )}

      {examples.map(example => {
        return getReactJson(example, responseTypeCopy);
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
  setResponseType,
  responseType,
}) {
  const examples = exampleResponses.length ? exampleResponses : showCodeResults(operation);
  const hasExamples = examples.find(e => e.code && e.code !== '{}');
  return (
    <div className="hub-reference-results-examples code-sample">
      {examples && examples.length > 0 && hasExamples && (
        <span>
          <ExampleTabs examples={examples} selected={selected} setExampleTab={setExampleTab} />
          <div className="code-sample-body">
            {examples.map((example, index) => {
              const isJson = example.language && contentTypeIsJson(example.language);

              const getHighlightedExample = ex => {
                return syntaxHighlighter(ex.code, ex.language, {
                  dark: true,
                });
              };

              const transformExampleIntoReactJson = ex => {
                try {
                  return getReactJson(ex);
                } catch (e) {
                  return getHighlightedExample(ex);
                }
              };

              return (
                <pre
                  className={`tomorrow-night tabber-body tabber-body-${index}`}
                  style={{ display: index === selected ? 'block' : '' }}
                  key={index} // eslint-disable-line react/no-array-index-key
                >
                  {example.multipleExamples &&
                    showExamples(example.multipleExamples, setResponseType, responseType)}

                  {isJson && !example.multipleExamples ? (
                    transformExampleIntoReactJson(example)
                  ) : (
                    <div>{getHighlightedExample(example)}</div>
                  )}
                </pre>
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
  responseType: PropTypes.string,
  setExampleTab: PropTypes.func.isRequired,
  setResponseType: PropTypes.func.isRequired,
  exampleResponses: PropTypes.arrayOf(PropTypes.shape({})),
};

Example.defaultProps = {
  result: {},
  responseType: null,
  exampleResponses: [],
};
