const syntaxHighlighter = require('../../../readme-syntax-highlighter');
const getLangName = require('../lib/generate-code-snippets');
const statusCodes = require('../lib/statuscodes');
const PropTypes = require('prop-types');
const React = require('react');

const BlockCode = ({ data, opts = {} }) => {
  if (!data || !data.codes || data.codes.length === 0 || data.codes[0].code === '' || data.codes[0].code === '{}') {
    return null;
  }

  return (
    <span>
      {
        // eslint-disable-next-line jsx-a11y/label-has-for
        opts.label && <label>{opts.label}</label>
      }
      <div className="magic-block-code">
        {(!opts.hideHeaderOnOne || data.codes.length > 1) && (
          <ul className="block-code-header">
            {
              data.codes.map((code, i) => (
                <li>
                  <a href="" onClick={`showCode${i}`} style={`active: ${i === 'tab'} `}>
                    {
                      //eslint-disable-next-line
                      code.status ? (
                        <span>
                          <span className={`status-icon status-icon-${statusCodes(code.status)[2]}`} />
                          { !statusCodes(code.status)[3] && statusCodes(code.status)[0] }
                          <em>{code.name ? code.name : statusCodes(code.status)[1]}</em>
                        </span>
                      ) : (code.name ? code.name : getLangName(code.language))
                    }
                  </a>
                </li>
              ))
            }
          </ul>
        )}

        <div className="block-code-code">
          {
            data.codes.map(code => (
              <pre>
                <code>{syntaxHighlighter(code.code, code.language, opts.dark)}</code>
              </pre>
            ))
          }
        </div>
      </div>
    </span>
  );
};

BlockCode.propTypes = {
  data: PropTypes.shape({
    codes: PropTypes.array.isRequired,
  }).isRequired,
  opts: PropTypes.shape({
    label: PropTypes.string.isRequired,
  }).isRequired,
};

module.exports = BlockCode;
