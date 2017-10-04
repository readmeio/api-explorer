const syntaxHighlighter = require('../../../readme-syntax-highlighter');
const { getLangName } = require('../lib/generate-code-snippets');
const statusCodes = require('../lib/statuscodes');
const PropTypes = require('prop-types');
const React = require('react');
const classNames = require('classnames');

class BlockCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeTab: 0 };
  }
  showCode(i) {
    this.setState({ activeTab: i });
  }
  render() {
    const { block, opts = {} } = this.props;
    const codes = Array.isArray(block.data.codes) ? block.data.codes : [];

    return (
      <span>
        {// eslint-disable-next-line jsx-a11y/label-has-for
        opts.label && <label>{opts.label}</label>}
        <div className="magic-block-code">
          {(!opts.hideHeaderOnOne || codes.length > 1) && (
            <ul className="block-code-header">
              {codes.map((code, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={i}>
                  <a
                    href=""
                    onClick={e => {
                      e.preventDefault();
                      this.showCode(i);
                    }}
                    className={classNames({ active: i === this.state.activeTab })}
                  >
                    {//eslint-disable-next-line
                    code.status ? (
                      <span>
                        <span
                          className={`status-icon status-icon-${statusCodes(code.status)[2]}`}
                        />
                        {!statusCodes(code.status)[3] && statusCodes(code.status)[0]}
                        <em>{code.name ? code.name : statusCodes(code.status)[1]}</em>
                      </span>
                    ) : code.name ? (
                      code.name
                    ) : (
                      getLangName(code.language)
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="block-code-code">
            {codes.map((code, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <pre key={i} style={{ display: i === this.state.activeTab ? 'block' : 'none' }}>
                {
                  <code
                    // eslint-disable-next-line
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlighter(code.code, code.language, opts.dark),
                    }}
                  />
                }
              </pre>
            ))}
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
  opts: PropTypes.shape({
    label: PropTypes.string,
  }),
};

BlockCode.defaultProps = {
  block: { data: {} },
  opts: {},
};

module.exports = BlockCode;
