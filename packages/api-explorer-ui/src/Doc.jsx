const React = require('react');
const PropTypes = require('prop-types');
const fetchHar = require('fetch-har');
const oasToHar = require('./lib/oas-to-har');
const isAuthReady = require('./lib/is-auth-ready');
const extensions = require('../../readme-oas-extensions');
const Waypoint = require('react-waypoint');

const { Fragment } = React;

const PathUrl = require('./PathUrl');
const Params = require('./Params');
const CodeSample = require('./CodeSample');
const Response = require('./Response');
const ResponseSchema = require('./ResponseSchema');

const Oas = require('./lib/Oas');
const showCode = require('./lib/show-code');
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
    this.oas = new Oas(this.props.oas);
    this.onSubmit = this.onSubmit.bind(this);
    this.toggleAuth = this.toggleAuth.bind(this);
    this.hideResults = this.hideResults.bind(this);
    this.waypointEntered = this.waypointEntered.bind(this);
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
    const operation = this.oas.operation(this.props.doc.swagger.path, this.props.doc.api.method);

    if (!isAuthReady(operation, this.state.formData.auth)) {
      this.setState({ showAuthBox: true });
      setTimeout(() => {
        this.authInput.focus();
        this.setState({ needsAuth: true });
      }, 600);
      return false;
    }

    this.setState({ loading: true, showAuthBox: false, needsAuth: false });

    const har = oasToHar(this.oas, operation, this.state.formData, { proxyUrl: true });

    return fetchHar(har).then(async res => {
      this.setState({
        loading: false,
        result: await parseResponse(har, res),
      });
    });
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

  themeMain(doc, oas, operation, setLanguage) {
    return (
      // TODO use <> syntax
      <Fragment>
        <PathUrl
          oas={oas}
          operation={operation}
          dirty={this.state.dirty}
          loading={this.state.loading}
          onChange={this.onChange}
          showAuthBox={this.state.showAuthBox}
          needsAuth={this.state.needsAuth}
          toggleAuth={this.toggleAuth}
          onSubmit={this.onSubmit}
          authInputRef={el => (this.authInput = el)}
        />

        {showCode(oas, operation) && (
          <div className="hub-reference-section hub-reference-section-code">
            <div className="hub-reference-left">
              <CodeSample
                oas={oas}
                setLanguage={setLanguage}
                operation={operation}
                formData={this.state.formData}
                language={this.props.language}
              />
            </div>
            <Response
              result={this.state.result}
              oas={oas}
              operation={operation}
              oauthUrl={this.props.oauthUrl}
              hideResults={this.hideResults}
            />
          </div>
        )}

        <div className="hub-reference-section">
          <div className="hub-reference-left">
            <Params
              oas={oas}
              operation={operation}
              formData={this.state.formData}
              onChange={this.onChange}
              onSubmit={this.onSubmit}
            />
          </div>
          <div className="hub-reference-right switcher">
            {operation.responses && <ResponseSchema operation={operation} />}
          </div>
        </div>

        <Content body={doc.body} flags={this.props.flags} isThreeColumn />
      </Fragment>
    );
  }

  themeStripe(doc, oas, operation, setLanguage) {
    return (
      <div className="hub-reference-section">
        <Fragment>
          <div className="hub-reference-left">
            <PathUrl
              oas={oas}
              operation={operation}
              dirty={this.state.dirty}
              loading={this.state.loading}
              onChange={this.onChange}
              showAuthBox={this.state.showAuthBox}
              needsAuth={this.state.needsAuth}
              toggleAuth={this.toggleAuth}
              onSubmit={this.onSubmit}
              authInputRef={el => (this.authInput = el)}
            />
            <Params
              oas={oas}
              operation={operation}
              formData={this.state.formData}
              onChange={this.onChange}
              onSubmit={this.onSubmit}
            />
            <Content body={doc.body} flags={this.props.flags} isThreeColumn='left' />
          </div>

          <div className="hub-reference-right">
            {showCode(oas, operation) && (
              <div className="hub-reference-section-code">
                <CodeSample
                  oas={oas}
                  setLanguage={setLanguage}
                  operation={operation}
                  formData={this.state.formData}
                  language={this.props.language}
                />
                <div className="hub-reference-results tabber-parent">
                  <Response
                    result={this.state.result}
                    oas={oas}
                    operation={operation}
                    oauthUrl={this.props.oauthUrl}
                    hideResults={this.hideResults}
                  />
                </div>
              </div>
            )}
            <Content body={doc.body} flags={this.props.flags} isThreeColumn='right' />
          </div>
        </Fragment>
      </div>
    );
  }

  renderEndpoint() {
    const { doc, setLanguage } = this.props;
    const oas = this.oas;
    const operation = oas.operation(doc.swagger.path, doc.api.method);

    return (
      <div className="hub-api">
        {this.props.flags.stripe ? (
          this.themeStripe(doc, oas, operation, setLanguage)
        ) : (
          this.themeMain(doc, oas, operation, setLanguage)
        )}
      </div>
    );
  }

  render() {
    const { doc } = this.props;
    const oas = this.oas;

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
                <a className="hub-reference-edit pull-right" href={`reference-edit/${doc.slug}`}>
                  <i className="icon icon-register" />
                  Suggest Edits
                </a>
              )}
              <h2>{doc.title}</h2>
              {doc.excerpt && (
                <div className="excerpt">
                  {
                    // eslint-disable-next-line react/no-danger
                    <p dangerouslySetInnerHTML={{ __html: doc.excerpt }} />
                  }
                </div>
              )}
            </header>
          </div>
          <div className="hub-reference-right">&nbsp;</div>
        </div>

        {doc.type === 'endpoint' && (
          <Waypoint onEnter={this.waypointEntered} fireOnRapidScroll={false}>
            {this.state.showEndpoint && this.renderEndpoint()}
          </Waypoint>
        )}

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
    }),
    swagger: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }),
  }).isRequired,
  oas: PropTypes.shape({}),
  setLanguage: PropTypes.func.isRequired,
  flags: PropTypes.shape({
    stripe: PropTypes.bool
  }),
  language: PropTypes.string.isRequired,
  oauthUrl: PropTypes.string,
  suggestedEdits: PropTypes.bool.isRequired,
};

Doc.defaultProps = {
  oas: {},
  flags: {
    stripe: false,
  },
  oauthUrl: '',
};
