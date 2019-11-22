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

    this.state = {
      language: Cookie.get('readme_language') || this.getDefaultLanguage(),
      selectedApp: {
        selected: '',
        changeSelected: this.changeSelected,
      },
      auth: getAuth(this.props.variables.user, this.props.oasFiles),
      group: this.getGroup(),
    };

    this.changeGroup = this.changeGroup.bind(this);
    this.groups =
      this.props.variables.user.keys &&
      this.props.variables.user.keys.map(key => ({ id: key.id, name: key.name }));

    this.lazyHash = this.buildLazyHash();
  }

  onAuthChange(auth) {
    this.setState(previousState => {
      return {
        auth: { ...previousState.auth, ...auth },
      };
    });
  }

  getGroup() {
    if (this.props.variables.user.keys && this.props.variables.user.keys[0].id) {
      return this.props.variables.user.keys[0].id;
    }

    if (this.props.variables.user.id) {
      return this.props.variables.user.id;
    }

    return undefined;
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

  changeGroup(group) {
    this.setState({ group });
  }

  isLazy(index) {
    if (this.props.dontLazyLoad) return false;
    return this.lazyHash[index];
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
    const range = num => [...new Array(num).keys()];

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
    const docs = this.props.docs.filter(doc => {
      // If the HTTP method is `parameters`, then it represents common parameters and we shouldn't
      // attempt to render it as a normal API operation.
      if (typeof doc.api !== 'undefined' && doc.api.method === 'parameters') {
        return false;
      }

      return true;
    });

    return (
      <div className={`is-lang-${this.state.language}`}>
        <div
          className={`content-body hub-reference-sticky hub-reference-theme-${this.props.appearance.referenceLayout}`}
          id="hub-reference"
        >
          {docs.map((doc, index) => (
            <VariablesContext.Provider key={index} value={this.props.variables}>
              <OauthContext.Provider value={this.props.oauth}>
                <GlossaryTermsContext.Provider value={this.props.glossaryTerms}>
                  <BaseUrlContext.Provider value={this.props.baseUrl.replace(/\/$/, '')}>
                    <SelectedAppContext.Provider value={this.state.selectedApp}>
                      <Doc
                        key={doc._id}
                        appearance={this.props.appearance}
                        auth={this.state.auth}
                        baseUrl={this.props.baseUrl.replace(/\/$/, '')}
                        changeGroup={this.changeGroup}
                        doc={doc}
                        flags={this.props.flags}
                        group={this.state.group}
                        groups={this.groups}
                        language={this.state.language}
                        lazy={this.isLazy(index)}
                        Logs={this.props.Logs}
                        oas={this.getOas(doc)}
                        oauth={this.props.oauth}
                        onAuthChange={this.onAuthChange}
                        setLanguage={this.setLanguage}
                        suggestedEdits={this.props.suggestedEdits}
                        tryItMetrics={this.props.tryItMetrics}
                        user={this.props.variables.user}
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
  appearance: PropTypes.shape({
    referenceLayout: PropTypes.string,
    splitReferenceDocs: PropTypes.bool,
  }).isRequired,
  baseUrl: PropTypes.string,
  docs: PropTypes.arrayOf(PropTypes.object).isRequired,
  dontLazyLoad: PropTypes.bool,
  flags: PropTypes.shape({
    correctnewlines: PropTypes.bool,
  }),
  glossaryTerms: PropTypes.arrayOf(
    PropTypes.shape({
      definition: PropTypes.string.isRequired,
      term: PropTypes.string.isRequired,
    }),
  ).isRequired,
  Logs: PropTypes.func,
  oasFiles: PropTypes.shape({}).isRequired,
  oauth: PropTypes.bool,
  suggestedEdits: PropTypes.bool.isRequired,
  tryItMetrics: PropTypes.func,
  variables: PropTypes.shape({
    defaults: PropTypes.arrayOf(
      PropTypes.shape({
        default: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ).isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      keys: PropTypes.array,
    }).isRequired,
  }).isRequired,
};

ApiExplorer.defaultProps = {
  baseUrl: '/',
  dontLazyLoad: false,
  flags: {
    correctnewlines: false,
  },
  Logs: undefined,
  oauth: false,
  tryItMetrics: () => {},
};

// eslint-disable-next-line react/display-name
module.exports = props => (
  <ErrorBoundary>
    <ApiExplorer {...props} />
  </ErrorBoundary>
);

module.exports.ApiExplorer = ApiExplorer;
