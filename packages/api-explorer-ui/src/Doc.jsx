const React = require('react');
const PropTypes = require('prop-types');
const isAuthReady = require('./lib/auth-required');
const extensions = require('../../readme-oas-extensions');

const PathUrl = require('./PathUrl');
const Params = require('./Params');
const CodeSample = require('./CodeSample');

const Oas = require('./lib/Oas');
const showCode = require('./lib/show-code');
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
    };
    this.onChange = this.onChange.bind(this);
    this.oas = new Oas(this.props.oas);
    this.onSubmit = this.onSubmit.bind(this);
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
    if (
      !isAuthReady(
        this.oas.operation(this.props.doc.swagger.path, this.props.doc.api.method),
        this.state.formData.auth,
      )
    ) {
      this.setState({ showAuthBox: true, needsAuth: true });
      return false;
    }
    return true;
  }

  renderEndpoint() {
    const { doc, setLanguage } = this.props;
    const oas = this.oas;
    const operation = oas.operation(doc.swagger.path, doc.api.method);
    return (
      <div className="hub-api">
        <PathUrl
          oas={oas}
          operation={operation}
          dirty={this.state.dirty}
          loading={this.state.loading}
          onChange={this.onChange}
          authData={this.state.formData.auth}
          showAuthBox={this.state.showAuthBox}
          needsAuth={this.state.needsAuth}
        />

        {showCode(oas, operation) && (
          <div className="hub-reference-section hub-reference-section-code">
            <div className="hub-reference-left">
              <CodeSample
                oas={oas}
                setLanguage={setLanguage}
                operation={operation}
                formData={this.state.formData}
              />
            </div>
            <div className="hub-reference-right" />
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
          <div className="hub-reference-right switcher" />
        </div>
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
              {
                // TODO suggested edits
              }
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

        {doc.type === 'endpoint' && this.renderEndpoint()}

        <Content body={doc.body} is-three-column />
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
};

Doc.defaultProps = {
  oas: {},
};
