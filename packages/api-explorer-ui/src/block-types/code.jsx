const syntaxHighlighter = require('../../../readme-syntax-highlighter');

const BlockCode = ({data, opts}) => {
  (!data || !data.codes || data.codes.length === 0 || data.codes[0].code === '' || data.codes[0].code ==='{}') && (
      opts = opts || {};

      (opts.label) && (
          <label>
            {opts.label}
          </label>
      )

      <div className="magic-block-code">
        (!opts.hideHeaderOnOne || data.codes.length > 1) && (
          <ul className="block-code-header">
            for (code, i in data.codes) {
              <li>
                <a href="" onClick={`showCode${i}`} style={`active: ${i === 'tab'} `}>
                  { (() => {
                      switch(code) {
                        case code.status : return (
                          <span className={`status-icon status-icon-${statusCodes(code.status)[2]}`}>
                            (!statusCodes(code.status)[3]) && (
                                  {statusCodes (code.status)[0]}
                            )
                          </span>
                          <em>
                            {code.name ? code.name : statusCodes(code.status)[1]}
                          </em>
                        )
                        default: return (
                          switch(code) {
                            case code.name : return (
                              {code.name}
                            )
                            default: return (

                            )
                          }
                      }
                  }) ()
                }
                </a>
              </li>
            }
          </ul>
        )

        <div className="block-code-code">
          for (code, i in data.codes) {
            <pre>
              <code dangerouslySetInnerHTML={syntaxHighlighter(code.code, code.language, opts.dark)}></code>
            </pre>
          }
        </div>
      </div>
  )
};

module.exports = BlockCode;
