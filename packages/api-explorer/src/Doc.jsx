const React = require('react');
const PropTypes = require('prop-types');
const fetchHar = require('fetch-har');
const oasToHar = require('./lib/oas-to-har');
const isAuthReady = require('./lib/is-auth-ready');
const extensions = require('@readme/oas-extensions');
const Waypoint = require('react-waypoint');

const { Fragment } = React;

const PathUrl = require('./PathUrl');
const createParams = require('./Params');
const CodeSample = require('./CodeSample');
const Response = require('./Response');
const ResponseSchema = require('./ResponseSchema');
const EndpointErrorBoundary = require('./EndpointErrorBoundary');
const markdown = require('@readme/markdown');

const Oas = require('./lib/Oas');
// const showCode = require('./lib/show-code');
const parseResponse = require('./lib/parse-response');
const Content = require('./block-types/Content');

class Doc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      dirty: false,
      loading: false,
      showAuthBox: false,
      needsAuth: false,
      result: null,
      showEndpoint: false,
    };
    this.onChange = this.onChange.bind(this);
    this.oas = new Oas(this.props.oas, this.props.user);
    this.onSubmit = this.onSubmit.bind(this);
    this.toggleAuth = this.toggleAuth.bind(this);
    this.hideResults = this.hideResults.bind(this);
    this.waypointEntered = this.waypointEntered.bind(this);
    this.Params = createParams(this.oas);
  }

  onChange(formData) {
    this.setState(previousState => {
      return {
        formData: Object.assign({}, previousState.formData, formData),
        dirty: true,
      };
    });
  }
  onSubmit() {
    const operation = this.getOperation();

    if (!isAuthReady(operation, this.props.auth)) {
      this.setState({ showAuthBox: true });
      setTimeout(() => {
        this.authInput.focus();
        this.setState({ needsAuth: true });
      }, 600);
      return false;
    }

    this.setState({ loading: true, showAuthBox: false, needsAuth: false });

    const har = oasToHar(this.oas, operation, this.state.formData, this.props.auth, {
      proxyUrl: true,
    });

    return fetchHar(har).then(async res => {
      this.props.tryItMetrics(har, res);

      this.setState({
        loading: false,
        result: await parseResponse(har, res),
      });
    });
  }

  getOperation() {
    if (this.operation) return this.operation;

    const { doc } = this.props;
    const operation = doc.swagger ? this.oas.operation(doc.swagger.path, doc.api.method) : null;
    this.operation = operation;
    return operation;
  }

  toggleAuth(e) {
    e.preventDefault();
    this.setState({ showAuthBox: !this.state.showAuthBox });
  }

  hideResults() {
    this.setState({ result: null });
  }

  waypointEntered() {
    this.setState({ showEndpoint: true });
  }

  // TODO: I couldn't figure out why this existed
  // Shouldn't we always show code samples?
  // eslint-disable-next-line
  shouldShowCode() {
    return true;
    // return showCode(this.oas, this.getOperation());
  }

  mainTheme(doc) {
    return (
      <Fragment>
        {doc.type === 'endpoint' && (
          <div className="hub-api">
            {this.renderPathUrl()}

            {this.shouldShowCode() && (
              <div className="hub-reference-section hub-reference-section-code">
                <div className="hub-reference-left">{this.renderCodeSample()}</div>
                {this.renderResponse()}
              </div>
            )}

            <div className="hub-reference-section">
              <div className="hub-reference-left">
                {this.renderLogs()}
                {this.renderParams()}
              </div>
              <div className="hub-reference-right switcher">{this.renderResponseSchema()}</div>
            </div>
          </div>
        )}

        <Content body={doc.body} flags={this.props.flags} isThreeColumn />
      </Fragment>
    );
  }

  columnTheme(doc) {
    return (
      <div className="hub-api">
        <div className="hub-reference-section">
          <Fragment>
            <div className="hub-reference-left">
              {doc.type === 'endpoint' && (
                <Fragment>
                  {this.renderPathUrl()}
                  {this.renderLogs()}
                  {this.renderParams()}
                </Fragment>
              )}
              <Content body={doc.body} flags={this.props.flags} isThreeColumn="left" />
            </div>

            <div className="hub-reference-right">
              {doc.type === 'endpoint' &&
              this.shouldShowCode() && (
                <div className="hub-reference-section-code">
                  {this.renderCodeSample()}
                  <div className="hub-reference-results tabber-parent">{this.renderResponse()}</div>
                </div>
              )}
              <div className="hub-reference-right switcher">
                {this.renderResponseSchema('dark')}
              </div>
              <Content body={doc.body} flags={this.props.flags} isThreeColumn="right" />
            </div>
          </Fragment>
        </div>
      </div>
    );
  }

  renderCodeSample() {
    let examples;
    try {
      examples = this.props.doc.api.examples.codes;
    } catch (e) {
      examples = [];
    }

    return (
      <CodeSample
        oas={this.oas}
        setLanguage={this.props.setLanguage}
        operation={this.getOperation()}
        formData={this.state.formData}
        auth={this.props.auth}
        language={this.props.language}
        examples={examples}
      />
    );
  }

  renderResponse() {
    let exampleResponses;
    try {
      exampleResponses = this.props.doc.api.results.codes;
    } catch (e) {
      exampleResponses = [];
    }
    return (
      <Response
        result={this.state.result}
        oas={this.oas}
        operation={this.getOperation()}
        oauth={this.props.oauth}
        hideResults={this.hideResults}
        exampleResponses={exampleResponses}
      />
    );
  }

  renderResponseSchema(theme = 'light') {
    const operation = this.getOperation();

    return (
      operation &&
      operation.responses && (
        <ResponseSchema theme={theme} operation={this.getOperation()} oas={this.oas} />
      )
    );
  }

  renderEndpoint() {
    const { doc } = this.props;

    return (
      <EndpointErrorBoundary>
        {this.props.appearance.referenceLayout === 'column' ? (
          this.columnTheme(doc)
        ) : (
          this.mainTheme(doc)
        )}
      </EndpointErrorBoundary>
    );
  }

  renderLogs() {
    if (!this.props.Logs) return null;
    const { Logs } = this.props;
    const operation = this.getOperation();
    const { method } = operation;
    const url = `${this.oas.url()}${operation.path}`;

    return (
      <Logs
        user={this.props.user}
        baseUrl={this.props.baseUrl}
        query={{
          url,
          method,
        }}
      />
    );
  }

  renderParams() {
    return (
      <this.Params
        oas={this.oas}
        operation={this.getOperation()}
        formData={this.state.formData}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
      />
    );
  }

  renderPathUrl() {
    /* eslint-disable no-return-assign */
    return (
      <PathUrl
        oas={this.oas}
        operation={this.getOperation()}
        dirty={this.state.dirty}
        loading={this.state.loading}
        onChange={this.props.onAuthChange}
        showAuthBox={this.state.showAuthBox}
        needsAuth={this.state.needsAuth}
        oauth={this.props.oauth}
        toggleAuth={this.toggleAuth}
        onSubmit={this.onSubmit}
        authInputRef={el => (this.authInput = el)}
        auth={this.props.auth}
      />
    );
  }

  render() {
    const { doc } = this.props;
    const oas = this.oas;

    const renderEndpoint = () => {
      if (this.props.appearance.splitReferenceDocs) return this.renderEndpoint();

      return (
        <Waypoint onEnter={this.waypointEntered} fireOnRapidScroll={false} bottomOffset="-1%">
          {this.state.showEndpoint && this.renderEndpoint()}
        </Waypoint>
      );
    };

    return (
      <div className="hub-reference" id={`page-${doc.slug}`}>
        {
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a className="anchor-page-title" id={doc.slug} />
        }

        <div className="hub-reference-section hub-reference-section-top">
          <div className="hub-reference-left">
            <header>
              {this.props.suggestedEdits && (
                // eslint-disable-next-line jsx-a11y/href-no-hash
                <a
                  className="hub-reference-edit pull-right"
                  href={`${this.props.baseUrl}/reference-edit/${doc.slug}`}
                >
                  <i className="icon icon-register" />
                  Suggest Edits
                </a>
              )}
              <h2>{doc.title}</h2>
              {doc.excerpt && <div className="excerpt">{markdown(doc.excerpt)}</div>}
            </header>
          </div>
          <div className="hub-reference-right">&nbsp;</div>
        </div>

        {renderEndpoint()}

        {
          // TODO maybe we dont need to do this with a hidden input now
          // cos we can just pass it around?
        }
        <input
          type="hidden"
          id={`swagger-${extensions.SEND_DEFAULTS}`}
          value={oas[extensions.SEND_DEFAULTS]}
        />
      </div>
    );
  }
}

module.exports = Doc;

Doc.propTypes = {
  doc: PropTypes.shape({
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    slug: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    api: PropTypes.shape({
      method: PropTypes.string.isRequired,
      examples: PropTypes.shape({
        codes: PropTypes.arrayOf(
          PropTypes.shape({
            language: PropTypes.string.isRequired,
            code: PropTypes.string.isRequired,
          }),
        ),
      }),
      results: PropTypes.shape({
        codes: PropTypes.arrayOf(
          PropTypes.shape({}), // TODO: Jsinspect threw an error because this was too similar to L330
        ),
      }),
    }),
    swagger: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }),
  }).isRequired,
  user: PropTypes.shape({}),
  auth: PropTypes.shape({}).isRequired,
  Logs: PropTypes.func,
  oas: PropTypes.shape({}),
  setLanguage: PropTypes.func.isRequired,
  flags: PropTypes.shape({
    correctnewlines: PropTypes.bool,
  }).isRequired,
  appearance: PropTypes.shape({
    referenceLayout: PropTypes.string,
    splitReferenceDocs: PropTypes.bool,
  }).isRequired,
  language: PropTypes.string.isRequired,
  baseUrl: PropTypes.string,
  oauth: PropTypes.bool.isRequired,
  suggestedEdits: PropTypes.bool.isRequired,
  tryItMetrics: PropTypes.func.isRequired,
  onAuthChange: PropTypes.func.isRequired,
};

Doc.defaultProps = {
  oas: {},
  flags: {
    correctnewlines: false,
  },
  appearance: {
    referenceLayout: 'row',
    splitReferenceDocs: false,
  },
  Logs: undefined,
  user: undefined,
  baseUrl: '/',
};
