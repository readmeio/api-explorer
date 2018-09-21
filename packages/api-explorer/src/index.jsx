const React = require('react');
const Cookie = require('js-cookie');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const VariablesContext = require('@readme/variable/contexts/Variables');
const OauthContext = require('@readme/variable/contexts/Oauth');
const GlossaryTermsContext = require('@readme/markdown/contexts/GlossaryTerms');
const SelectedAppContext = require('@readme/variable/contexts/SelectedApp');

const ErrorBoundary = require('./ErrorBoundary');
const Doc = require('./Doc');

class ApiExplorer extends React.Component {
  constructor(props) {
    super(props);

    this.setLanguage = this.setLanguage.bind(this);
    this.getDefaultLanguage = this.getDefaultLanguage.bind(this);
    this.changeSelected = this.changeSelected.bind(this);

    this.state = {
      language: Cookie.get('readme_language') || this.getDefaultLanguage(),
      apiKey: this.getApiKey(),
      selectedApp: {
        selected: '',
        changeSelected: this.changeSelected,
      },
    };
  }

  getApiKey() {
    // This supports:
    // { apiKey: 'key' }
    // { keys: [{ name: 'a', apiKey: 'key' }] }
    // { keys: [{ name: 'a', api_key: 'key' }] }
    //
    // TODO this should update the selected key throughout
    // based upon the SelectedApp
    //
    // TODO we should remove the dependency on pulling this
    // in from a cookie, and just use `props.variables.user`
    function tryGetApiKey(userData) {
      try {
        return userData.apiKey || userData.keys[0].apiKey || userData.keys[0].api_key;
      } catch (e) {
        return undefined;
      }
    }

    const apiKey =
      tryGetApiKey(this.props.variables.user) || tryGetApiKey(Cookie.getJSON('user_data'));

    return apiKey || undefined;
  }

  setLanguage(language) {
    this.setState({ language });
    Cookie.set('readme_language', language);
  }

  getDefaultLanguage() {
    try {
      const firstOas = Object.keys(this.props.oasFiles)[0];
      return this.props.oasFiles[firstOas][extensions.SAMPLES_LANGUAGES][0];
    } catch (e) {
      return 'curl';
    }
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
    return (
      <div className={`is-lang-${this.state.language}`}>
        <div
          id="hub-reference"
          className={`content-body hub-reference-sticky hub-reference-theme-${this.props.appearance
            .referenceLayout}`}
        >
          {this.props.docs.map(doc => (
            <VariablesContext.Provider value={this.props.variables}>
              <OauthContext.Provider value={this.props.oauth}>
                <GlossaryTermsContext.Provider value={this.props.glossaryTerms}>
                  <SelectedAppContext.Provider value={this.state.selectedApp}>
                    <Doc
                      key={doc._id}
                      doc={doc}
                      oas={this.getOas(doc)}
                      setLanguage={this.setLanguage}
                      flags={this.props.flags}
                      appearance={this.props.appearance}
                      language={this.state.language}
                      oauth={this.props.oauth}
                      suggestedEdits={this.props.suggestedEdits}
                      apiKey={this.state.apiKey}
                      tryItMetrics={this.props.tryItMetrics}
                    />
                  </SelectedAppContext.Provider>
                </GlossaryTermsContext.Provider>
              </OauthContext.Provider>
            </VariablesContext.Provider>
          ))}
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
    apilogs: PropTypes.bool,
  }).isRequired,
  oauth: PropTypes.bool,
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
    apilogs: false,
  },
  tryItMetrics: () => {},
};

module.exports = props => (
  <ErrorBoundary>
    <ApiExplorer {...props} />
  </ErrorBoundary>
);
module.exports.ApiExplorer = ApiExplorer;
