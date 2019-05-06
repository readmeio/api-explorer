import {FormattedMessage} from 'react-intl';

const React = require('react');
const PropTypes = require('prop-types');
const ReactJson = require('react-json-view').default;
const showCodeResults = require('./lib/show-code-results');
const contentTypeIsJson = require('./lib/content-type-is-json');

// const { replaceVars } = require('./lib/replace-vars');
const syntaxHighlighter = require('@mia-platform/syntax-highlighter');
const extensions = require('@mia-platform/oas-extensions');

const ExampleTabs = require('./ExampleTabs');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

function Example({ operation, result, oas, selected, setExampleTab, exampleResponses }) {
  const examples = exampleResponses.length ? exampleResponses : showCodeResults(operation);
  const hasExamples = examples.find(e => e.code && e.code !== '{}');
  return (
    <div className="hub-reference-results-examples code-sample">
      {examples &&
      examples.length > 0 &&
      hasExamples && (
        <span>
          <ExampleTabs examples={examples} selected={selected} setExampleTab={setExampleTab} />
          <div className="code-sample-body">
            {examples.map((example, index) => {
              const isJson = example.language && contentTypeIsJson(example.language);
              return (
                <pre
                  className={`tomorrow-night tabber-body tabber-body-${index}`}
                  style={{ display: index === selected ? 'block' : '' }}
                  key={index} // eslint-disable-line react/no-array-index-key
                >
                  {isJson ? (
                    <ReactJson
                      src={JSON.parse(example.code)}
                      collapsed={2}
                      collapseStringsAfterLength={100}
                      enableClipboard={false}
                      theme="tomorrow"
                      name={null}
                      displayDataTypes={false}
                      displayObjectSize={false}
                      style={{
                        padding: '20px 10px',
                        backgroundColor: 'transparent',
                        fontSize: '12px',
                      }}
                    />
                  ) : (
                    <div>{syntaxHighlighter(example.code, example.language, { dark: true })}</div>
                  )}
                </pre>
              );
            })}
          </div>
        </span>
      )}
      {(examples.length === 0 || (!hasExamples && result === null)) && (
        <div className="hub-no-code">
          {oas[extensions.EXPLORER_ENABLED] ? (
            <FormattedMessage id="code.example.try" defaultMessage="Try the API to see Results" />
          ) : (
            <FormattedMessage id="code.example.na" defaultMessage="No response examples available" />
          )}
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
  setExampleTab: PropTypes.func.isRequired,
  exampleResponses: PropTypes.arrayOf(PropTypes.shape({})),
};

Example.defaultProps = {
  result: {},
  exampleResponses: [],
};
