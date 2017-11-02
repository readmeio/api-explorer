const React = require('react');
const classNames = require('classnames');
const PropTypes = require('prop-types');
const showCodeResults = require('./lib/show-code-results');
const statusCodes = require('./lib/statuscodes');
// const { replaceVars } = require('./lib/replace-vars');
const extensions = require('../../readme-oas-extensions');
const { getLangName } = require('./lib/generate-code-snippet');
const codemirror = require('../../readme-syntax-highlighter/codemirror');
const IconStatus = require('./IconStatus');
const ResponseMetadata = require('./ResponseMetadata');
const ResponseBody = require('./ResponseBody');

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
                  {
                    // eslint-disable-next-line jsx-a11y/href-no-hash
                    <a
                      href="#" // eslint eslint-disable-line jsx-a11y/href-no-hash
                      data-tab="result"
                      className={classNames('hub-reference-results-header-item tabber-tab', {
                        selected: this.state.selectedTab === 'result',
                      })}
                      onClick={e => {
                        e.preventDefault();
                        this.setTab('result');
                      }}
                    >
                      <IconStatus status={result.status} />
                    </a>
                  }
                  {
                    // eslint-disable-next-line jsx-a11y/href-no-hash
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
                  }
                  {showCodeResults(oas, operation).length > 0 && (
                    // eslint-disable-next-line jsx-a11y/href-no-hash
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

                {this.state.selectedTab === 'result' && (
                  <ResponseBody result={result} oauthUrl={oauthUrl} isOauth={!!securities.OAuth2} />
                )}
                {this.state.selectedTab === 'metadata' && <ResponseMetadata result={result} />}
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
                      // eslint-disable-next-line jsx-a11y/href-no-hash
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
                        key={index} // eslint-disable-line react/no-array-index-key
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
