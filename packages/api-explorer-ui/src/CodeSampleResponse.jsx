const React = require('react');
const classNames = require('classnames');
const PropTypes = require('prop-types');
const showCodeResults = require('./lib/show-code-results');
const statusCodes = require('./lib/statuscodes');
// const { replaceVars } = require('./lib/replace-vars');
const extensions = require('../../readme-oas-extensions');
const { getLangName } = require('./lib/generate-code-snippet');
const syntaxHighlighter = require('../../readme-syntax-highlighter');
const codemirror = require('../../readme-syntax-highlighter/codemirror');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

class CodeSampleResponse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'result',
      exampleTab: 0,
      result: props.result,
    };
    this.setTab = this.setTab.bind(this);
    this.exampleTab = this.exampleTab.bind(this);
    this.hideResults = this.hideResults;
  }

  setTab(selected) {
    this.setState({ selectedTab: selected });
  }

  exampleTab(index) {
    this.setState({ exampleTab: index });
  }

  hideResults() {
    this.setState({ result: null });
  }

  render() {
    const { result, oas, operation, oauthUrl } = this.props;
    const securities = operation.prepareSecurity();

    return (
      <div
        className={classNames('hub-reference-right hub-reference-results tabber-parent', {
          on: result !== null,
        })}
      >
        <div className="hub-reference-results-slider">
          <div className="hub-reference-results-explorer code-sample">
            {result !== null && (
              <span>
                <ul className="code-sample-tabs hub-reference-results-header">
                  <a
                    href="#"
                    data-tab="result"
                    className={classNames('hub-reference-results-header-item tabber-tab', {
                      selected: this.state.selectedTab === 'result',
                    })}
                    onClick={e => {
                      e.preventDefault();
                      this.setTab('result');
                    }}
                  >
                    <span
                      className={classNames({
                        httpsuccess: result.statusCode[2] === 'success',
                        httperror: result.statusCode[2] !== 'success',
                      })}
                    >
                      <i className="fa fa-circle" />
                      <em>
                        &nbsp;{result.statusCode[0]}&nbsp;
                        {result.statusCode[1]}
                      </em>
                    </span>
                  </a>
                  <a
                    href="#"
                    data-tab="metadata"
                    className={classNames('hub-reference-results-header-item tabber-tab', {
                      selected: this.state.selectedTab === 'metadata',
                    })}
                    onClick={e => {
                      e.preventDefault();
                      this.setTab('metadata');
                    }}
                  >
                    Metadata
                  </a>
                  {showCodeResults(oas, operation).length > 0 && (
                    <a
                      className="hub-reference-results-back pull-right"
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        this.hideResults();
                      }}
                    >
                      <span className="fa fa-chevron-circle-left"> to examples </span>
                    </a>
                  )}
                </ul>
                <div
                  className="tabber-body tabber-body-result"
                  style={{
                    display: this.state.selectedTab === 'result' ? 'block' : 'none',
                  }}
                >
                  {result.statusCode[0] !== 401 && (
                    <pre className="tomorrow-night">
                      {result.isBinary && <div>A binary file was returned</div>}
                      {!result.isBinary && (
                        <div
                          className="cm-s-tomorrow-night codemirror-highlight"
                          dangerouslySetInnerHTML={{
                            __html: syntaxHighlighter(
                              JSON.stringify(result.responseBody),
                              'javascript',
                            ),
                          }}
                        />
                      )}
                    </pre>
                  )}

                  {result.statusCode[0] === 401 && (
                    <div className="text-center hub-expired-token">
                      {securities.OAuth2 ? (
                        () => {
                          if (oauthUrl) {
                            return (
                              <div>
                                <p>Your OAuth2 token has expired</p>
                                <a className="btn btn-primary" href="/oauth" target="_self">
                                  Reauthenticate via OAuth2
                                </a>
                              </div>
                            );
                          }
                          return <p>Your OAuth2 token is incorrect or has expired</p>;
                        }
                      ) : (
                        <p>You couldn&apos;t be authenticated</p>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className="hub-reference-results-meta tabber-body-metadata tabber-body"
                  style={{ display: this.state.selectedTab === 'metadata' ? 'block' : 'none' }}
                >
                  <div className="meta">
                    <label>Method</label>
                    <div>{result.method.toString()}</div>
                  </div>

                  <div className="meta">
                    <label>URL</label>
                    <div>{result.url}</div>
                  </div>

                  <div className="meta">
                    <label>Request Headers</label>
                    <pre>{result.requestHeaders.join('\n')}</pre>
                  </div>

                  <div className="meta">
                    <label>Request Data</label>
                    <pre>{JSON.stringify(result.responseBody)}</pre>
                  </div>

                  <div className="meta">
                    <label>Status</label>
                    <span className="httpstatus">
                      <span
                        className={classNames({
                          httpsuccess: result.statusCode[2] === 'success',
                          httperror: result.statusCode[2] !== 'success',
                        })}
                      >
                        <i className="fa fa-circle" />
                        <em>
                          &nbsp;{result.statusCode[0]}&nbsp;
                          {result.statusCode[1]}
                        </em>
                      </span>
                    </span>
                  </div>

                  <div className="meta">
                    <label htmlFor="response headers">Response Headers</label>
                    <pre>{result.responseHeaders.join('\n')}</pre>
                  </div>
                </div>
              </span>
            )}
          </div>

          <div className="hub-reference-results-examples code-sample">
            {showCodeResults(operation).length > 0 && (
              <span>
                <ul className="code-sample-tabs hub-reference-results-header">
                  {showCodeResults(operation).map((example, index) => {
                    const status = statusCodes(example.status);
                    const title = example.name ? example.name : status[1];

                    return (
                      <a
                        className={
                          index === this.state.exampleTab ? (
                            'hub-reference-results-header-item tabber-tab selected'
                          ) : (
                            'hub-reference-results-header-item tabber-tab '
                          )
                        }
                        href="#"
                        data-tab={index}
                        key={index}
                        onClick={e => {
                          e.preventDefault();
                          this.exampleTab(index);
                        }}
                      >
                        {example.status ? (
                          <span className={status[2] === 'success' ? 'httpsuccess' : 'httperror'}>
                            <i className="fa fa-circle" />
                            <em>
                              &nbsp;{status[0]}&nbsp;{title}
                            </em>
                          </span>
                        ) : (
                          <span>{getLangName(example.language)}</span>
                        )}
                      </a>
                    );
                  })}
                </ul>
                <div className="code-sample-body">
                  {showCodeResults(operation).map((example, index) => {
                    return (
                      <pre
                        className={`tomorrow night tabber-body tabber-body-${index}`}
                        style={{ display: index === this.state.exampleTab ? 'block' : '' }}
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
        </div>
      </div>
    );
  }
}

module.exports = CodeSampleResponse;

CodeSampleResponse.propTypes = {
  result: PropTypes.shape({}),
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  oauthUrl: PropTypes.string,
};

CodeSampleResponse.defaultProps = {
  result: {},
  oauthUrl: '',
};
