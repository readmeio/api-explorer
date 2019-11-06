/* eslint-disable react/jsx-fragments */
const React = require('react');
const PropTypes = require('prop-types');
const fetchHar = require('fetch-har');
const extensions = require('@readme/oas-extensions');
const markdown = require('@readme/markdown');
const Waypoint = require('react-waypoint');

const oasToHar = require('./lib/oas-to-har');
const isAuthReady = require('./lib/is-auth-ready');

const PathUrl = require('./PathUrl');
const createParams = require('./Params');
const CodeSample = require('./CodeSample');
const Response = require('./Response');
const ResponseSchema = require('./ResponseSchema');
const EndpointErrorBoundary = require('./EndpointErrorBoundary');

const Oas = require('./lib/Oas');
const { Operation } = require('./lib/Oas');
const getPath = require('./lib/get-path');
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
        formData: { ...previousState.formData, ...formData },
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
    let operation = doc.swagger ? this.oas.operation(doc.swagger.path, doc.api.method) : null;
    if (!getPath(this.oas, doc)) {
      operation = new Operation(this.oas, doc.swagger.path, doc.api.method, {
        parameters: doc.api.params,
      });
    }
    this.operation = operation;
    return operation;
  }

  toggleAuth(e) {
    e.preventDefault();
    this.setState(prevState => ({ showAuthBox: !prevState.showAuthBox }));
  }

  hideResults() {
    this.setState({ result: null });
  }

  waypointEntered() {
    this.setState({ showEndpoint: true });
  }

  mainTheme(doc) {
    return (
      <React.Fragment>
        {doc.type === 'endpoint' && (
          <div className="hub-api">
            {this.renderPathUrl()}

            <div className="hub-reference-section hub-reference-section-code">
              <div className="hub-reference-left">{this.renderCodeSample()}</div>

              {this.renderResponse()}
            </div>

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
      </React.Fragment>
    );
  }

  columnTheme(doc) {
    return (
      <div className="hub-api">
        <div className="hub-reference-section">
          <React.Fragment>
            <div className="hub-reference-left">
              {doc.type === 'endpoint' && (
                <React.Fragment>
                  {this.renderPathUrl()}
                  {this.renderLogs()}
                  {this.renderParams()}
                </React.Fragment>
              )}

              <Content body={doc.body} flags={this.props.flags} isThreeColumn="left" />
            </div>

            <div className="hub-reference-right">
              {doc.type === 'endpoint' && (
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
          </React.Fragment>
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
        auth={this.props.auth}
        examples={examples}
        formData={this.state.formData}
        language={this.props.language}
        oas={this.oas}
        operation={this.getOperation()}
        setLanguage={this.props.setLanguage}
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
        exampleResponses={exampleResponses}
        hideResults={this.hideResults}
        oas={this.oas}
        oauth={this.props.oauth}
        onChange={this.onChange}
        operation={this.getOperation()}
        result={this.state.result}
      />
    );
  }

  renderResponseSchema(theme = 'light') {
    const operation = this.getOperation();

    return (
      operation &&
      operation.responses && (
        <ResponseSchema oas={this.oas} operation={this.getOperation()} theme={theme} />
      )
    );
  }

  renderEndpoint() {
    const { doc } = this.props;

    return (
      <EndpointErrorBoundary>
        {this.props.appearance.referenceLayout === 'column'
          ? this.columnTheme(doc)
          : this.mainTheme(doc)}
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
        baseUrl={this.props.baseUrl}
        changeGroup={this.props.changeGroup}
        group={this.props.group}
        groups={this.props.groups}
        query={{
          url,
          method,
        }}
        result={this.state.result}
        user={this.props.user}
      />
    );
  }

  renderParams() {
    return (
      <this.Params
        formData={this.state.formData}
        oas={this.oas}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
        operation={this.getOperation()}
      />
    );
  }

  renderPathUrl() {
    /* eslint-disable no-return-assign */
    return (
      <PathUrl
        auth={this.props.auth}
        authInputRef={el => (this.authInput = el)}
        dirty={this.state.dirty}
        loading={this.state.loading}
        needsAuth={this.state.needsAuth}
        oas={this.oas}
        oauth={this.props.oauth}
        onChange={this.props.onAuthChange}
        onSubmit={this.onSubmit}
        operation={this.getOperation()}
        showAuthBox={this.state.showAuthBox}
        toggleAuth={this.toggleAuth}
      />
    );
  }

  render() {
    const { doc, lazy } = this.props;
    const { oas } = this;

    const renderEndpoint = () => {
      if (this.props.appearance.splitReferenceDocs) return this.renderEndpoint();
      if (lazy) {
        return (
          <Waypoint bottomOffset="-1%" fireOnRapidScroll={false} onEnter={this.waypointEntered}>
            {this.state.showEndpoint && this.renderEndpoint()}
          </Waypoint>
        );
      }

      return this.renderEndpoint();
    };

    return (
      <div className="hub-reference" id={`page-${doc.slug}`}>
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid */}
        <a className="anchor-page-title" id={doc.slug} />

        <div className="hub-reference-section hub-reference-section-top">
          <div className="hub-reference-left">
            <header>
              {this.props.suggestedEdits && (
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
          id={`swagger-${extensions.SEND_DEFAULTS}`}
          type="hidden"
          value={oas[extensions.SEND_DEFAULTS]}
        />
      </div>
    );
  }
}

Doc.propTypes = {
  appearance: PropTypes.shape({
    referenceLayout: PropTypes.string,
    splitReferenceDocs: PropTypes.bool,
  }),
  auth: PropTypes.shape({}).isRequired,
  baseUrl: PropTypes.string,
  changeGroup: PropTypes.func.isRequired,
  doc: PropTypes.shape({
    api: PropTypes.shape({
      examples: PropTypes.shape({
        codes: PropTypes.arrayOf(
          PropTypes.shape({
            code: PropTypes.string.isRequired,
            language: PropTypes.string.isRequired,
          }),
        ),
      }),
      method: PropTypes.string.isRequired,
      params: PropTypes.object,
      results: PropTypes.shape({
        codes: PropTypes.arrayOf(PropTypes.shape({})),
      }),
    }),
    excerpt: PropTypes.string,
    slug: PropTypes.string.isRequired,
    swagger: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }),
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  flags: PropTypes.shape({
    correctnewlines: PropTypes.bool,
  }),
  group: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
  language: PropTypes.string.isRequired,
  lazy: PropTypes.bool,
  Logs: PropTypes.func,
  oas: PropTypes.shape({}),
  oauth: PropTypes.bool.isRequired,
  onAuthChange: PropTypes.func.isRequired,
  setLanguage: PropTypes.func.isRequired,
  suggestedEdits: PropTypes.bool.isRequired,
  tryItMetrics: PropTypes.func.isRequired,
  user: PropTypes.shape({}),
};

Doc.defaultProps = {
  appearance: {
    referenceLayout: 'row',
    splitReferenceDocs: false,
  },
  baseUrl: '/',
  flags: {
    correctnewlines: false,
  },
  group: '',
  groups: [],
  lazy: true,
  Logs: undefined,
  oas: {},
  user: {},
};

module.exports = Doc;
