const React = require('react');
const PropTypes = require('prop-types');
const { constructRequest } = require('fetch-har');
const extensions = require('@readme/oas-extensions');
const markdown = require('@readme/markdown').default;
const markdownMagic = require('@readme/markdown-magic');
const { Waypoint } = require('react-waypoint');
const oasToHar = require('@readme/oas-to-har');
const Oas = require('oas/tooling');
const { getPath, matchesMimeType } = require('oas/tooling/utils');

const { TutorialTile } = require('@readme/ui/.bundles/es/ui/compositions');

const isAuthReady = require('./lib/is-auth-ready');

const PathUrl = require('./PathUrl');
const createParams = require('./Params');
const CodeSample = require('./CodeSample');
const Response = require('./Response');
const ResponseSchema = require('./ResponseSchema');
const ErrorBoundary = require('./ErrorBoundary');

const { Operation } = Oas;
const parseResponse = require('./lib/parse-response');
const Content = require('./block-types/Content');

const stringifyPretty = data => JSON.stringify(data, undefined, 2);

class Doc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dirty: {
        form: false,
        json: false,
      },

      editingMode: 'form',
      formData: {},

      // For raw mode we should default the body to an empty JSON object. If this operation has a
      // request body example that we can use, it'll get filled in when the `componentDidMount`
      // event kicks.
      formDataJson: {},

      // This'll hold a copy of the original raw JSON block incase the user wants to reset their
      // changes.
      formDataJsonOriginal: {},

      // This holds a copy of whatever data the user is currently inputting into the JSON request
      // code editor. On page load it'll hold the contents of `formDataJson` until the user makes
      // changes.
      formDataJsonRaw: '{}',

      loading: false,
      needsAuth: false,
      result: null,
      showAuthBox: false,
      showEndpoint: false,

      validationErrors: {
        form: false,
        json: false,
      },
    };

    this.enableRequestBodyJsonEditor = false;
    this.hideResults = this.hideResults.bind(this);

    this.onChange = this.onChange.bind(this);
    this.onJsonChange = this.onJsonChange.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.operation = this.getOperation();
    this.Params = createParams(this.props.oas, this.operation);

    this.resetForm = this.resetForm.bind(this);

    this.toggleAuth = this.toggleAuth.bind(this);
    this.waypointEntered = this.waypointEntered.bind(this);

    // If we need to build out the request body JSON editor let's pull examples to fill it with.
    if (this.shouldEnableRequestBodyJsonEditor()) {
      const examples = this.operation.getRequestBodyExamples();
      if (!Object.keys(examples).length) {
        return;
      }

      const jsonExamples = examples.filter(
        ex => matchesMimeType.json(ex.mediaType) || matchesMimeType.wildcard(ex.mediaType)
      );

      if (jsonExamples.length) {
        const example = jsonExamples[0];
        let code = false;

        if (example.code) {
          code = example.code;
        } else if (example.multipleExamples) {
          code = example.multipleExamples[0].code;
        }

        try {
          // Examples are stringified when we get them from `oas` because they need to be stringified for
          // `@readme/syntax-highlighter` but because we need to pass a usable non-stringified object/array/primitive
          // to our `CodeSample` component and `@readme/oas-to-har` we're parsing it out here. Cool? Cool.
          code = JSON.parse(code);
        } catch (e) {
          code = {};
        }

        code = code || {};

        this.state.formDataJson = code;
        this.state.formDataJsonOriginal = code;
        this.state.formDataJsonRaw = stringifyPretty(code);
      }
    }
  }

  resetForm() {
    this.setState(previousState => {
      return {
        dirty: {
          ...previousState.dirty,
          json: false,
        },
        formDataJson: previousState.formDataJsonOriginal,
        formDataJsonRaw: stringifyPretty(previousState.formDataJsonOriginal),
        validationErrors: {
          ...previousState.validationErrors,
          json: false,
        },
      };
    });
  }

  onChange(formData) {
    this.setState(previousState => {
      return {
        dirty: {
          ...previousState.dirty,
          form: true,
        },
        formData: { ...previousState.formData, ...formData },
        validationErrors: {
          ...previousState.validationErrors,
          form: false,
        },
      };
    });
  }

  onJsonChange(rawData) {
    this.setState(previousState => {
      let data;
      try {
        data = JSON.parse(rawData);

        return {
          dirty: {
            ...previousState.dirty,
            json: true,
          },
          formDataJson: data,
          formDataJsonRaw: rawData,
          validationErrors: {
            ...previousState.validationErrors,
            json: false,
          },
        };
      } catch (err) {
        return {
          dirty: {
            ...previousState.dirty,
            json: true,
          },
          formDataJson: previousState.formDataJson,
          formDataJsonRaw: rawData,
          validationErrors: {
            ...previousState.validationErrors,
            json: err.message,
          },
        };
      }
    });
  }

  onModeChange(mode) {
    this.setState({
      editingMode: mode.toLowerCase(),
    });
  }

  onSubmit() {
    if (!isAuthReady(this.operation, this.props.auth)) {
      this.setState({ showAuthBox: true });
      setTimeout(() => {
        this.authInput.focus();
        this.setState({ needsAuth: true });
      }, 600);
      return false;
    }

    this.setState({ loading: true, showAuthBox: false, needsAuth: false });

    const har = oasToHar(this.props.oas, this.operation, this.getFormDataForCurrentMode(), this.props.auth, {
      proxyUrl: true,
    });

    const request = constructRequest(har);

    return fetch(request).then(async res => {
      this.props.tryItMetrics(har, res);

      this.setState({
        loading: false,
        result: await parseResponse(har, res),
      });
    });
  }

  isDirty() {
    return this.state.editingMode === 'form' ? this.state.dirty.form : this.state.dirty.json;
  }

  getValidationErrors() {
    const { editingMode, validationErrors } = this.state;

    return editingMode === 'form' ? validationErrors.form : validationErrors.json;
  }

  getFormDataForCurrentMode() {
    const { editingMode, formData, formDataJson } = this.state;

    if (editingMode === 'form') {
      return formData;
    }

    return {
      ...formData,
      body: formDataJson,
    };
  }

  getOperation() {
    if (this.operation) return this.operation;

    const { doc } = this.props;
    let operation = doc.swagger ? this.props.oas.operation(doc.swagger.path, doc.api.method) : null;
    if (!getPath(this.props.oas, doc)) {
      operation = new Operation(this.props.oas, doc.swagger.path, doc.api.method, {
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

  shouldEnableRequestBodyJsonEditor() {
    // Instead of just relying on if the prop is set, or setting this in the component constructor, we're checking if
    // it's changed against the current stored value because in the demo server you can toggle raw mode on and off and
    // we should only do these supplemental checks if we absolutely need to.
    if (this.enableRequestBodyJsonEditor !== this.props.enableRequestBodyJsonEditor) {
      // Request body raw mode should only be enabled if the operation has a request body to fill out and its delivered
      // with a JSON-compatible media type.
      if (this.operation) {
        if (this.operation.hasRequestBody()) {
          if (this.operation.isJson()) {
            this.enableRequestBodyJsonEditor = this.props.enableRequestBodyJsonEditor;
          }
        }
      }
    }

    return this.enableRequestBodyJsonEditor;
  }

  mainTheme(doc) {
    const { useNewMarkdownEngine } = this.props;

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
                {this.renderParams()}
                {this.renderLogs()}
              </div>
              <div className="hub-reference-right switcher">{this.renderResponseSchema()}</div>
            </div>
          </div>
        )}

        <Content
          body={doc.body}
          flags={this.props.flags}
          isThreeColumn
          splitReferenceDocs={this.props.appearance.splitReferenceDocs}
          useNewMarkdownEngine={useNewMarkdownEngine}
        />
      </React.Fragment>
    );
  }

  columnTheme(doc) {
    const { useNewMarkdownEngine } = this.props;

    return (
      <div className="hub-api">
        <div className="hub-reference-section">
          <React.Fragment>
            <div className="hub-reference-left">
              {doc.type === 'endpoint' && (
                <React.Fragment>
                  {this.renderPathUrl()}
                  {this.renderParams()}
                  {this.renderLogs()}
                </React.Fragment>
              )}

              <Content
                body={doc.body}
                flags={this.props.flags}
                isThreeColumn="left"
                splitReferenceDocs={this.props.appearance.splitReferenceDocs}
                useNewMarkdownEngine={useNewMarkdownEngine}
              />
            </div>
            <div className="hub-reference-right">
              {doc.type === 'endpoint' && (
                <div className="hub-reference-section-code">
                  {this.renderCodeSample()}
                  <div className="hub-reference-results tabber-parent">{this.renderResponse()}</div>
                </div>
              )}
              <div className="hub-reference-right switcher">{this.renderResponseSchema('dark')}</div>
              <Content
                body={doc.body}
                flags={this.props.flags}
                isThreeColumn="right"
                splitReferenceDocs={this.props.appearance.splitReferenceDocs}
                useNewMarkdownEngine={useNewMarkdownEngine}
              />
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
        formData={this.getFormDataForCurrentMode()}
        language={this.props.language}
        oas={this.props.oas}
        oasUrl={this.props.oasUrl}
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
        oas={this.props.oas}
        oauth={this.props.oauth}
        onChange={this.onChange}
        operation={this.getOperation()}
        result={this.state.result}
      />
    );
  }

  renderResponseSchema(theme = 'light') {
    const { useNewMarkdownEngine } = this.props;
    const operation = this.getOperation();

    return (
      operation &&
      operation.schema &&
      operation.schema.responses && (
        <ResponseSchema
          oas={this.props.oas}
          operation={operation}
          theme={theme}
          useNewMarkdownEngine={useNewMarkdownEngine}
        />
      )
    );
  }

  renderEndpoint() {
    const { doc, maskErrorMessages, onError } = this.props;

    return (
      <ErrorBoundary appContext="endpoint" maskErrorMessages={maskErrorMessages} onError={onError}>
        {this.props.appearance.referenceLayout === 'column' ? this.columnTheme(doc) : this.mainTheme(doc)}
      </ErrorBoundary>
    );
  }

  renderLogs() {
    if (!this.props.Logs) return null;
    const { Logs } = this.props;
    const operation = this.getOperation();
    const { method } = operation;
    const url = `${this.props.oas.url()}${operation.path}`;

    return (
      <Logs
        baseUrl={this.props.baseUrl}
        changeGroup={this.props.onAuthGroupChange}
        group={this.props.group}
        groups={this.props.groups}
        loginUrl={this.props.loginUrl}
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
    const { formData, formDataJsonRaw, validationErrors } = this.state;

    return (
      <this.Params
        enableJsonEditor={this.shouldEnableRequestBodyJsonEditor()}
        formData={formData}
        formDataJsonRaw={formDataJsonRaw}
        oas={this.props.oas}
        onChange={this.onChange}
        onJsonChange={this.onJsonChange}
        onModeChange={this.onModeChange}
        onSubmit={this.onSubmit}
        operation={this.getOperation()}
        resetForm={this.resetForm}
        validationErrors={validationErrors}
      />
    );
  }

  renderPathUrl() {
    return (
      <PathUrl
        auth={this.props.auth}
        authInputRef={el => (this.authInput = el)} // eslint-disable-line no-return-assign
        dirty={this.isDirty()}
        group={this.props.group}
        groups={this.props.groups}
        loading={this.state.loading}
        needsAuth={this.state.needsAuth}
        oas={this.props.oas}
        oauth={this.props.oauth}
        onAuthGroupChange={this.props.onAuthGroupChange}
        onChange={this.props.onAuthChange}
        onSubmit={this.onSubmit}
        operation={this.getOperation()}
        resetForm={this.resetForm}
        showAuthBox={this.state.showAuthBox}
        toggleAuth={this.toggleAuth}
        validationErrors={this.getValidationErrors()}
      />
    );
  }

  render() {
    const { doc, lazy, oas, useNewMarkdownEngine } = this.props;

    const renderEndpoint = () => {
      if (this.props.appearance.splitReferenceDocs) return this.renderEndpoint();
      if (lazy) {
        return (
          <Waypoint bottomOffset="-1%" fireOnRapidScroll={false} onEnter={this.waypointEntered}>
            {this.state.showEndpoint ? this.renderEndpoint() : <div />}
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
                <a className="hub-reference-edit pull-right" href={`${this.props.baseUrl}/reference-edit/${doc.slug}`}>
                  <i className="icon icon-register" />
                  Suggest Edits
                </a>
              )}

              <h2>{doc.title}</h2>
              {doc.excerpt && (
                <div className="markdown-body excerpt">
                  {useNewMarkdownEngine ? markdown(doc.excerpt, { copyButtons: false }) : markdownMagic(doc.excerpt)}
                </div>
              )}
            </header>
            {doc.tutorials && !!doc.tutorials.length && (
              <div className="TutorialTile-Container">
                {doc.tutorials.map((t, idx) => (
                  <TutorialTile key={`tutorial-${idx}`} openTutorial={this.props.openTutorialModal} tutorial={t} />
                ))}
              </div>
            )}
          </div>
          <div className="hub-reference-right">&nbsp;</div>
        </div>

        {renderEndpoint()}
        {
          // TODO maybe we dont need to do this with a hidden input now
          // cos we can just pass it around?
        }
        <input id={`swagger-${extensions.SEND_DEFAULTS}`} type="hidden" value={oas[extensions.SEND_DEFAULTS]} />
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
  doc: PropTypes.shape({
    api: PropTypes.shape({
      examples: PropTypes.shape({
        codes: PropTypes.arrayOf(
          PropTypes.shape({
            code: PropTypes.string.isRequired,
            language: PropTypes.string.isRequired,
          })
        ),
      }),
      method: PropTypes.string.isRequired,
      params: PropTypes.arrayOf(PropTypes.object),
      results: PropTypes.shape({
        codes: PropTypes.arrayOf(PropTypes.shape({})),
      }),
    }),
    body: PropTypes.string,
    excerpt: PropTypes.string,
    slug: PropTypes.string.isRequired,
    swagger: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }),
    title: PropTypes.string.isRequired,
    tutorials: PropTypes.arrayOf(PropTypes.shape({})),
    type: PropTypes.string.isRequired,
  }).isRequired,
  enableRequestBodyJsonEditor: PropTypes.bool,
  flags: PropTypes.shape({
    correctnewlines: PropTypes.bool,
  }),
  group: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  language: PropTypes.string.isRequired,
  lazy: PropTypes.bool,
  loginUrl: PropTypes.string,
  Logs: PropTypes.func,
  maskErrorMessages: PropTypes.bool,
  oas: PropTypes.instanceOf(Oas).isRequired,
  oasUrl: PropTypes.string,
  oauth: PropTypes.bool.isRequired,
  onAuthChange: PropTypes.func.isRequired,
  onAuthGroupChange: PropTypes.func.isRequired,
  onDereferenceCompletion: PropTypes.func,
  onError: PropTypes.func,
  openTutorialModal: PropTypes.func,
  setLanguage: PropTypes.func.isRequired,
  suggestedEdits: PropTypes.bool.isRequired,
  tryItMetrics: PropTypes.func.isRequired,
  useNewMarkdownEngine: PropTypes.bool,
  user: PropTypes.shape({}),
};

Doc.defaultProps = {
  appearance: {
    referenceLayout: 'row',
    splitReferenceDocs: false,
  },
  baseUrl: '/',
  enableRequestBodyJsonEditor: false,
  flags: {
    correctnewlines: false,
  },
  group: '',
  groups: [],
  lazy: true,
  Logs: undefined,
  maskErrorMessages: true,
  oasUrl: '',
  onDereferenceCompletion: () => {},
  onError: () => {},
  openTutorialModal: () => {},
  useNewMarkdownEngine: false,
  user: {},
};

module.exports = Doc;
