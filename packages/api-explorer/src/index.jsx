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

const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

const getAuth = require('./lib/get-auth');

class ApiExplorer extends React.Component {
  constructor(props) {
    super(props);

    this.setLanguage = this.setLanguage.bind(this);
    this.getDefaultLanguage = this.getDefaultLanguage.bind(this);
    this.changeSelected = this.changeSelected.bind(this);
    this.onAuthChange = this.onAuthChange.bind(this);

    this.state = {
      language: Cookie.get('readme_language') || this.getDefaultLanguage(),
      selectedApp: {
        selected: '',
        changeSelected: this.changeSelected,
      },
      auth: getAuth(this.props.variables.user, this.props.oasFiles),
    };

    this.lazyHash = this.buildLazyHash();
  }

  onAuthChange(auth) {
    this.setState(previousState => {
      return {
        auth: Object.assign({}, previousState.auth, auth),
      };
    });
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

  /**
   * Be a bit more selective of that to lazy render
   * @return {Object} Builds a hash of which indexes of this.props.docs should
   * be lazy rendered.
   */
  buildLazyHash() {
    const { splitReferenceDocs } = this.props.appearance;
    if (splitReferenceDocs) return {};

    const { docs } = this.props;
    const range = num => [...Array(num).keys()];

    const hash = range(docs.length).reduce((total, idx) => {
      total[idx] = true;
      return total;
    }, {});

    // there is no hash, disable lazy rendering for the first 5 docs
    if (!window.location.hash) {
      range(5).forEach(index => {
        hash[index] = false;
      });
      return hash;
    }

    // if there is a hash in the URL, disable lazy rendering for the potential slug
    // and its neighbors
    const slug = window.location.hash.substr(1);
    const slugs = this.props.docs.map(x => x.slug);
    const indexOfSlug = slugs.indexOf(slug);
    const startIndex = indexOfSlug <= 2 ? 0 : indexOfSlug - 2;
    range(5).forEach(num => {
      hash[startIndex + num] = false;
    });
    return hash;
  }

  changeSelected(selected) {
    this.setState({ selectedApp: { selected, changeSelected: this.changeSelected } });
  }

  render() {
    const docs = this.props.docs.filter(doc => methods.includes(((doc || {}).api || {}).method));

    return (
      <div className={`is-lang-${this.state.language}`}>
        <div
          id="hub-reference"
          className={`content-body hub-reference-sticky hub-reference-theme-${this.props.appearance
            .referenceLayout}`}
        >
          {docs.map((doc, index) => (
            <VariablesContext.Provider value={this.props.variables}>
              <OauthContext.Provider value={this.props.oauth}>
                <GlossaryTermsContext.Provider value={this.props.glossaryTerms}>
                  <BaseUrlContext.Provider value={this.props.baseUrl.replace(/\/$/, '')}>
                    <SelectedAppContext.Provider value={this.state.selectedApp}>
                      <Doc
                        key={doc._id}
                        doc={doc}
                        lazy={this.lazyHash[index]}
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
    splitReferenceDocs: PropTypes.bool,
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
