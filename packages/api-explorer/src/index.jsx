const ReactResizeDetector = require('react-resize-detector').default;

const React = require('react');
const Cookie = require('js-cookie');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const VariablesContext = require('@readme/variable/contexts/Variables');
const OauthContext = require('@readme/variable/contexts/Oauth');
const GlossaryTermsContext = require('@readme/markdown/contexts/GlossaryTerms');
const BaseUrlContext = require('@readme/markdown/contexts/BaseUrl');
const SelectedAppContext = require('@readme/variable/contexts/SelectedApp');

const ErrorBoundary = require('./ErrorBoundary');
const Doc = require('./Doc');

const getAuth = require('./lib/get-auth');

class ApiExplorer extends React.Component {
  constructor(props) {
    super(props);

    this.setLanguage = this.setLanguage.bind(this);
    this.getDefaultLanguage = this.getDefaultLanguage.bind(this);
    this.changeSelected = this.changeSelected.bind(this);
    this.onAuthChange = this.onAuthChange.bind(this);
    this.onResize = this.onResize.bind(this);

    this.top = React.createRef();

    this.state = {
      language: Cookie.get('readme_language') || this.getDefaultLanguage(),
      selectedApp: {
        selected: '',
        changeSelected: this.changeSelected,
      },
      auth: getAuth(this.props.variables.user, this.props.oasFiles),
    };
  }

  onResize() {
    const elem = this.top.current;
    const contentHeight = elem.offsetHeight + elem.offsetTop;
    if (contentHeight < window.innerHeight) {
      this.setState({
        height: window.innerHeight - elem.offsetTop,
      });
    }
  }

  onAuthChange(auth) {
    this.setState(previousState => {
      return {
        auth: Object.assign({}, previousState.auth, auth),
      };
    });
  }

  getDefaultLanguage() {
    try {
      const firstOas = Object.keys(this.props.oasFiles)[0];
      return this.props.oasFiles[firstOas][extensions.SAMPLES_LANGUAGES][0];
    } catch (e) {
      return 'curl';
    }
  }

  setLanguage(language) {
    this.setState({ language });
    Cookie.set('readme_language', language);
  }

  getOas(doc) {
    // Get the apiSetting id from the following places:
    // - category.apiSetting if set and populated
    // - api.apiSetting if that's a string
    // - api.apiSetting._id if that's set
    // This will return undefined if apiSetting is not set
    const apiSetting =
      doc.category.apiSetting ||
      (typeof doc.api.apiSetting === 'string' && doc.api.apiSetting) ||
      (typeof doc.api.apiSetting === 'object' && doc.api.apiSetting && doc.api.apiSetting._id);

    return this.props.oasFiles[apiSetting];
  }

  changeSelected(selected) {
    this.setState({ selectedApp: { selected, changeSelected: this.changeSelected } });
  }

  render() {
    const topStyle = this.state.height ? { height: this.state.height } : {};
    const filler = this.state.height ? (
      <div className="filler">
        <div className="right" />
      </div>
    ) : (
      undefined
    );
    return (
      <div className={`is-lang-${this.state.language}`} ref={this.top} style={topStyle}>
        <ReactResizeDetector handleHeight onResize={this.onResize} />
        <div
          id="hub-reference"
          className={`content-body hub-reference-sticky hub-reference-theme-${this.props.appearance
            .referenceLayout}`}
        >
          {this.props.docs.map(doc => (
            <VariablesContext.Provider value={this.props.variables}>
              <OauthContext.Provider value={this.props.oauth}>
                <GlossaryTermsContext.Provider value={this.props.glossaryTerms}>
                  <BaseUrlContext.Provider value={this.props.baseUrl.replace(/\/$/, '')}>
                    <SelectedAppContext.Provider value={this.state.selectedApp}>
                      <Doc
                        key={doc._id}
                        doc={doc}
                        oas={this.getOas(doc)}
                        setLanguage={this.setLanguage}
                        flags={this.props.flags}
                        user={this.props.variables.user}
                        Logs={this.props.Logs}
                        baseUrl={this.props.baseUrl.replace(/\/$/, '')}
                        appearance={this.props.appearance}
                        language={this.state.language}
                        oauth={this.props.oauth}
                        suggestedEdits={this.props.suggestedEdits}
                        tryItMetrics={this.props.tryItMetrics}
                        auth={this.state.auth}
                        onAuthChange={this.onAuthChange}
                      />
                    </SelectedAppContext.Provider>
                  </BaseUrlContext.Provider>
                </GlossaryTermsContext.Provider>
              </OauthContext.Provider>
            </VariablesContext.Provider>
          ))}
          {filler}
        </div>
      </div>
    );
  }
}

ApiExplorer.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.object).isRequired,
  oasFiles: PropTypes.shape({}).isRequired,
  appearance: PropTypes.shape({
    referenceLayout: PropTypes.string,
  }).isRequired,
  flags: PropTypes.shape({
    correctnewlines: PropTypes.bool,
  }).isRequired,
  oauth: PropTypes.bool,
  baseUrl: PropTypes.string.isRequired,
  Logs: PropTypes.func,
  suggestedEdits: PropTypes.bool.isRequired,
  tryItMetrics: PropTypes.func,
  variables: PropTypes.shape({
    user: PropTypes.shape({
      keys: PropTypes.array,
    }).isRequired,
    defaults: PropTypes.arrayOf(
      PropTypes.shape({ name: PropTypes.string.isRequired, default: PropTypes.string.isRequired }),
    ).isRequired,
  }).isRequired,
  glossaryTerms: PropTypes.arrayOf(
    PropTypes.shape({ term: PropTypes.string.isRequired, definition: PropTypes.string.isRequired }),
  ).isRequired,
};

ApiExplorer.defaultProps = {
  oauth: false,
  flags: {
    correctnewlines: false,
  },
  tryItMetrics: () => {},
  Logs: undefined,
  baseUrl: '/',
};

module.exports = props => (
  <ErrorBoundary>
    <ApiExplorer {...props} />
  </ErrorBoundary>
);
module.exports.ApiExplorer = ApiExplorer;
