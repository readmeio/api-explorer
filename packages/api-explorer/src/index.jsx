const React = require('react');
const Cookie = require('js-cookie');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const OauthContext = require('@readme/variable/contexts/Oauth');
const SelectedAppContext = require('@readme/variable/contexts/SelectedApp');

const ErrorBoundary = require('./ErrorBoundary');
const Doc = require('./Doc');

const getAuth = require('./lib/get-auth');

const supportedHttpMethods = ['connect', 'delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'];

class ApiExplorer extends React.Component {
  constructor(props) {
    super(props);

    this.setLanguage = this.setLanguage.bind(this);
    this.getDefaultLanguage = this.getDefaultLanguage.bind(this);
    this.changeSelected = this.changeSelected.bind(this);
    this.onAuthChange = this.onAuthChange.bind(this);

    this.state = {
      auth: getAuth(this.props.variables.user, this.props.oasFiles),
      group: this.getGroup(),
      language: Cookie.get('readme_language') || this.getDefaultLanguage(),
      selectedApp: {
        selected: '',
        changeSelected: this.changeSelected,
      },
    };

    this.onAuthGroupChange = this.onAuthGroupChange.bind(this);

    this.groups =
      this.props.variables.user.keys &&
      this.props.variables.user.keys.map(key => ({
        // If we don't have an `id` present, default to the `name` instead.
        id: 'id' in key ? key.id : key.name,
        name: key.name,
      }));

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
    if (
      this.props.variables.user.keys &&
      this.props.variables.user.keys.length &&
      this.props.variables.user.keys[0].id
    ) {
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

  // eslint-disable-next-line class-methods-use-this
  getApiSettingFromDoc(doc) {
    // Get the apiSetting id from the following places:
    //  - category.apiSetting if set and populated
    //  - api.apiSetting if that's a string
    //  - api.apiSetting._id if that's set
    //
    // This will return undefined if apiSetting is not set
    return (
      doc.category.apiSetting ||
      (typeof doc.api.apiSetting === 'string' && doc.api.apiSetting) ||
      (typeof doc.api.apiSetting === 'object' && doc.api.apiSetting && doc.api.apiSetting._id)
    );
  }

  getOas(doc) {
    const apiSetting = this.getApiSettingFromDoc(doc);
    return this.props.oasFiles[apiSetting];
  }

  getOasUrl(doc) {
    const apiSetting = this.getApiSettingFromDoc(doc);
    return this.props.oasUrls[apiSetting];
  }

  /**
   * Change the current selected auth group and refresh the instance auth keys based on that selection.
   *
   * @param {string} group
   */
  onAuthGroupChange(group) {
    const { user } = this.props.variables;
    let groupName = false;
    if (user.keys) {
      // We need to remap the incoming group with the groups name so we can pick out the auth keys in `getAuth`.
      let keys = user.keys.find(key => key.id === group);
      if (keys !== undefined) {
        groupName = keys.name;
      } else {
        // If the keys that we have for a user don't have an `id` set up, but does have `name`, we can pull it off that
        // instead.
        keys = user.keys.find(key => !('id' in key) && key.name === group);
        if (keys !== undefined) {
          groupName = keys.name;
        }
      }
    }

    this.setState({
      group,
      auth: getAuth(user, this.props.oasFiles, groupName),
    });
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
      // If the HTTP method is something we don't support, then we shouldn't attempt to render it as a normal API
      // operation.
      if (
        typeof doc.api !== 'undefined' &&
        typeof doc.api.method !== 'undefined' &&
        !supportedHttpMethods.includes(doc.api.method.toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    /* eslint-disable global-require */
    const BaseUrlContext = require('@readme/markdown-magic/contexts/BaseUrl');
    const VariablesContext = require('@readme/variable/contexts/Variables');
    const GlossaryTermsContext = require('@readme/markdown-magic/contexts/GlossaryTerms');

    const { utils } = require('@readme/markdown');
    const NewBaseUrlContext = utils.BaseUrlContext;
    const NewVariablesContext = utils.VariablesContext;
    const NewGlossaryTermsContext = utils.GlossaryContext;
    /* eslint-enable global-require */

    return (
      <div className={`is-lang-${this.state.language}`}>
        <div
          className={`content-body hub-reference-sticky hub-reference-theme-${this.props.appearance.referenceLayout}`}
          id="hub-reference"
        >
          {docs.map((doc, index) => (
            <VariablesContext.Provider key={index} value={this.props.variables}>
              <NewVariablesContext.Provider key={index} value={this.props.variables}>
                <OauthContext.Provider value={this.props.oauth}>
                  <GlossaryTermsContext.Provider value={this.props.glossaryTerms}>
                    <NewGlossaryTermsContext.Provider value={this.props.glossaryTerms}>
                      <BaseUrlContext.Provider value={this.props.baseUrl.replace(/\/$/, '')}>
                        <NewBaseUrlContext.Provider value={this.props.baseUrl.replace(/\/$/, '')}>
                          <SelectedAppContext.Provider value={this.state.selectedApp}>
                            <Doc
                              key={doc._id}
                              appearance={this.props.appearance}
                              auth={this.state.auth}
                              baseUrl={this.props.baseUrl.replace(/\/$/, '')}
                              doc={doc}
                              flags={this.props.flags}
                              group={this.state.group}
                              groups={this.groups}
                              language={this.state.language}
                              lazy={this.isLazy(index)}
                              loginUrl={this.props.loginUrl}
                              Logs={this.props.Logs}
                              maskErrorMessages={this.props.maskErrorMessages}
                              oas={this.getOas(doc)}
                              oasUrl={this.getOasUrl(doc)}
                              oauth={this.props.oauth}
                              onAuthChange={this.onAuthChange}
                              onAuthGroupChange={this.onAuthGroupChange}
                              onError={this.props.onError}
                              setLanguage={this.setLanguage}
                              suggestedEdits={this.props.suggestedEdits}
                              tryItMetrics={this.props.tryItMetrics}
                              useNewMarkdownEngine={this.props.useNewMarkdownEngine}
                              user={this.props.variables.user}
                            />
                          </SelectedAppContext.Provider>
                        </NewBaseUrlContext.Provider>
                      </BaseUrlContext.Provider>
                    </NewGlossaryTermsContext.Provider>
                  </GlossaryTermsContext.Provider>
                </OauthContext.Provider>
              </NewVariablesContext.Provider>
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
    rdmdCompatibilityMode: PropTypes.bool,
  }),
  glossaryTerms: PropTypes.arrayOf(
    PropTypes.shape({
      definition: PropTypes.string.isRequired,
      term: PropTypes.string.isRequired,
    })
  ).isRequired,
  loginUrl: PropTypes.string,
  Logs: PropTypes.func,
  maskErrorMessages: PropTypes.bool,
  oasFiles: PropTypes.shape({}).isRequired,
  oasUrls: PropTypes.shape({}).isRequired,
  oauth: PropTypes.bool,
  onError: PropTypes.func,
  suggestedEdits: PropTypes.bool.isRequired,
  tryItMetrics: PropTypes.func,
  useNewMarkdownEngine: PropTypes.bool,
  variables: PropTypes.shape({
    defaults: PropTypes.arrayOf(
      PropTypes.shape({
        default: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
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
    rdmdCompatibilityMode: false,
  },
  Logs: undefined,
  maskErrorMessages: true,
  oauth: false,
  onError: () => {},
  tryItMetrics: () => {},
  useNewMarkdownEngine: false,
};

// eslint-disable-next-line react/display-name
module.exports = props => (
  // eslint-disable-next-line react/prop-types
  <ErrorBoundary appContext="explorer" maskErrorMessages={props.maskErrorMessages} onError={props.onError}>
    <ApiExplorer {...props} />
  </ErrorBoundary>
);

module.exports.ApiExplorer = ApiExplorer;
