const syntaxHighlighter = require('../../../readme-syntax-highlighter');
const getLangName = require('../lib/generate-code-snippets');

const BlockCode = ({data, opts}) => {
  (!data || !data.codes || data.codes.length === 0 || data.codes[0].code === '' || data.codes[0].code ==='{}') && (
      opts = opts || {})

      (opts.label) && (
          <label>
            {opts.label}
          </label>
      )

      (<div className="magic-block-code">
        (!opts.hideHeaderOnOne || data.codes.length > 1) && (
          <ul className="block-code-header">
            data.codes.map((code, i) => {
            <li>
              <a href="" onClick={`showCode${i}`} style={`active: ${i === 'tab'} `}>
                { (() => {
                  switch(code) {
                    case code.status : return (
                      <div>
                            <span className={`status-icon status-icon-${statusCodes(code.status)[2]}`}>
                            (!statusCodes(code.status)[3]) && (
                              {statusCodes (code.status)[0]}
                              )
                            </span>
                        <em>
                          {code.name ? code.name : statusCodes(code.status)[1]}
                        </em>
                      </div>
                    )
                    default: return
                      switch(code) {
                        case code.name : return
                          {code.name}
                        default: return
                          {getLangName(code.language)}
                      }
                  }
                }) ()}
              </a>
            </li>
            })
          </ul>
        )

        <div className="block-code-code">
          data.codes.map((code, i)=> {
            <pre>
              <code>{syntaxHighlighter(code.code, code.language, opts.dark)}</code>
            </pre>
          }
        </div>
      </div>)
};

module.exports = BlockCode;
