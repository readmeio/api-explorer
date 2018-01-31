const React = require('react');
const PropTypes = require('prop-types');
const showCodeResults = require('./lib/show-code-results');

// const { replaceVars } = require('./lib/replace-vars');
const codemirror = require('@readme/syntax-highlighter/codemirror');
const extensions = require('@readme/oas-extensions');

const ExampleTabs = require('./ExampleTabs');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

function Example({ operation, result, oas, selected, setExampleTab }) {
  return (
    <div className="hub-reference-results-examples code-sample">
      {showCodeResults(operation).length > 0 && (
        <span>
          <ExampleTabs operation={operation} selected={selected} setExampleTab={setExampleTab} />
          <div className="code-sample-body">
            {showCodeResults(operation).map((example, index) => {
              return (
                <pre
                  className={`tomorrow night tabber-body tabber-body-${index}`}
                  style={{ display: index === selected ? 'block' : '' }}
                  key={index} // eslint-disable-line react/no-array-index-key
                >
                  {codemirror(example.code, example.language, true)}
                </pre>
              );
            })}
          </div>
        </span>
      )}
      {showCodeResults(operation).length === 0 &&
      result === null && (
        <div className="hub-no-code">
          {oas[extensions.EXPLORER_ENABLED] ? (
            'Try the API to see Results'
          ) : (
            'No response examples available'
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
};

Example.defaultProps = {
  result: {},
};
