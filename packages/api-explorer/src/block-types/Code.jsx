/* eslint-disable unicorn/no-nested-ternary */
const PropTypes = require('prop-types');
const React = require('react');
const classNames = require('classnames');
const syntaxHighlighter = require('@readme/syntax-highlighter');

const CodeElement = require('./CodeElement');
const statusCodes = require('../lib/statuscodes');

const { uppercase } = syntaxHighlighter;

class BlockCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeTab: 0 };
  }

  showCode(i) {
    this.setState({ activeTab: i });
  }

  render() {
    const { block, opts = {}, dark } = this.props;
    const codes = Array.isArray(block.data.codes) ? block.data.codes : [];

    return (
      <span>
        {opts.label && <label>{opts.label}</label>}
        <div className="magic-block-code">
          {(!opts.hideHeaderOnOne || codes.length > 1) && (
            <ul className="block-code-header">
              {codes.map((code, i) => (
                <li key={i}>
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a
                    className={classNames({ active: i === this.state.activeTab })}
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      this.showCode(i);
                    }}
                  >
                    {code.status ? (
                      <span>
                        <span className={`status-icon status-icon-${statusCodes(code.status)[2]}`} />
                        {!statusCodes(code.status)[3] && statusCodes(code.status)[0]}
                        <em>{code.name ? code.name : statusCodes(code.status)[1]}</em>
                      </span>
                    ) : code.name ? (
                      code.name
                    ) : (
                      uppercase(code.language)
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="block-code-code">
            {codes.map((code, i) => {
              return <CodeElement key={i} activeTab={i === this.state.activeTab} code={code} dark={dark} />;
            })}
          </div>
        </div>
      </span>
    );
  }
}

BlockCode.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      codes: PropTypes.array,
    }),
  }),
  dark: PropTypes.bool,
  opts: PropTypes.shape({
    hideHeaderOnOne: PropTypes.bool,
    label: PropTypes.string,
  }),
};

BlockCode.defaultProps = {
  block: { data: {} },
  dark: false,
  opts: {},
};

module.exports = BlockCode;
