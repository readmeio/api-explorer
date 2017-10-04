const React = require('react');

function CodeSampleResponseTabs(styleClass, doc, swagger, variables) {
  const allSecurities = swaggerUtils.prepareSecurity(swagger);
  return(
    <div className="hub-reference-results-slider">
      <div className="hub-reference-results-explorer code-sample">
        {(styleClass === 'hub-reference-right hub-reference-results tabber-parent on') && null

        (
          <div>
            <ul className="code-sample-tabs hub-reference-results-header">
              <a
                href
                data-tab="result"
                className="hub-reference-results-header-item tabber-tab"
                onClick={e => e.preventDefault()}
              >
                <span>
                  <i className="fa fa-circle" />
                  <em>
                    {{results.statusCode[1]}}
                  </em>
                </span>
              </a>
              <a
                href
                data-tab="metadata"
                className="hub-reference-results-header-item tabber-tab"
                onClick={e => e.preventDefault()}
              >
                Metadata
              </a>
              {(swaggerUtils.showCodeResults(swagger).length) && (
                <a className="hub-reference-results-back pull-right" href="" onClick={hideResults}>
                  <span className="fa fa-chevron-circle-left"></span>
                  to examples
                </a>
              )}
            </ul>
            <div className="tabber-body tabber-body-result">
              <pre className="tomorrow-night">
                {/* TODO add results.isBinary logic */}
                <div>
                  <div className="cm-s-tomorrow-night codemirror-highlight">
                  </div>
                </div>
              </pre>
              <div>
                <div className="text-center hub-expired-token">
                  {if(allSecurities['OAuth2']){
                    if(project.oauth_url) {
                      return (
                        <p>Your OAuth2 token has expired</p>
                        {/* TODO add onClick to preventDefault? */}
                        <a className="btn btn-primary" href="/oauth" target="_self">Reauthenticate via OAuth2</a>
                      )
                    }
                    else {
                      return(<p> Your OAuth2 token is incorrect or has expired</p>)
                    }
                  }
                  else {
                    return ( <p>You couldn't be authenticated</p>)
                  }
                }
                </div>
              </div>
              <div
                className="hub-reference-results-meta tabber-body-metadata tabber-body"
              >
                <div className="meta">
                  <label>Method</label>
                  <div>{{results.method}}</div>
                </div>

                <div className="meta">
                  <label>URL</label>
                  <div>{{results.url}}</div>
                </div>

                <div className="meta">
                  <label>Request Headers</label>
                  <pre>{{results.requestHeaders}}</pre>
                </div>

                <div className="meta">
                  <label>Request Data</label>
                  <pre>{{results.data}}</pre>
                </div>

                <div className="meta">
                  <label>Status</label>
                  <span className="httpstatus">{{results.method}}</span>
                </div>

                <div className="meta">
                  <label>Response Headers</label>
                  <pre>{{results.responseHeaders}}</pre>
                </div>

              </div>
            </div>
          </div>
        );}
      </div>

      <div className="hub-reference-results-examples code-sample">
        {if( swaggerUtils.showCodeResults(swagger).length) {
          return (
            <ul className="code-samples-tabs hub-reference-results-header">
              {swaggerUtils.showCodeResults(swagger).forEach((result, index) => {
                const status = statusCodes(result.status);
                const title = result.name ? result.name : status[1];

                <a className="hub-reference-results-header-item tabber-tab" href="" data-tab={index} className={{index === 0 ? "selected" : ""}}>
                  {if(result.status) {
                    return (
                      <span className={{status[2] === "success" ? "httpsuccess" : "httperror" }}>
                        <i className="fa fa-circle"></i>
                        <em>`${title}`</em>
                      </span>
                    )
                  }
                  else {
                    return
                  }
                }
                </a>

              })}
            </ul>
          )
        }}
        <div className="hub-no-code">Try the API to see results</div>
      </div>
    </div>;
  )
}

module.exports = CodeSampleResponseTabs;
