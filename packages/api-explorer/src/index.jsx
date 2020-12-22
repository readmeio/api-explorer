const React = require('react');
const Cookie = require('js-cookie');
const PropTypes = require('prop-types');
const cloneDeep = require('lodash.clonedeep');
const extensions = require('@readme/oas-extensions');
const Oas = require('oas/tooling');

const OauthContext = require('@readme/variable/contexts/Oauth');
const SelectedAppContext = require('@readme/variable/contexts/SelectedApp');
const { cmVariableContext: TutorialVariableContext } = require('@readme/ui/.bundles/es/views');

const ErrorBoundary = require('./ErrorBoundary');
const Doc = require('./Doc');
const DocAsync = require('./DocAsync');
const { TutorialModal } = require('@readme/ui/.bundles/es/ui/compositions');

const getAuth = require('./lib/get-auth');
const { DEFAULT_TUTORIAL } = require('@readme/ui/.bundles/es/ui/compositions/Tutorials/Modal/constants/stepDefaults');

const supportedHttpMethods = ['connect', 'delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'];

class ApiExplorer extends React.Component {
  constructor(props) {
    super(props);

    this.changeSelected = this.changeSelected.bind(this);
    this.closeTutorialModal = this.closeTutorialModal.bind(this);
    this.getDefaultLanguage = this.getDefaultLanguage.bind(this);
    this.onAuthChange = this.onAuthChange.bind(this);
    this.onAuthGroupChange = this.onAuthGroupChange.bind(this);
    this.openTutorialModal = this.openTutorialModal.bind(this);
    this.setLanguage = this.setLanguage.bind(this);

    this.state = {
      auth: getAuth(this.props.variables.user, this.props.oasFiles),
      group: this.getGroup(),
      language: Cookie.get('readme_language') || this.getDefaultLanguage(),
      selectedApp: {
        selected: '',
        changeSelected: this.changeSelected,
      },
      selectedTutorial: DEFAULT_TUTORIAL,
      showTutorialModal: false,
    };

    this.groups =
      this.props.variables.user.keys &&
      this.props.variables.user.keys.map(key => ({
        // If we don't have an `id` present, default to the `name` instead.
        id: 'id' in key ? key.id : key.name,
        name: key.name,
      }));

    this.DocComponent = this.createDoc();

    this.lazyHash = this.buildLazyHash();

    this.oasInstances = {};
  }

  createDoc() {
    const { shouldDereferenceOas } = this.props;

    // Creating a stable test environment to be able to test the DocAsync component on this root Explorer component is
    // extremely challenging with our current adhoc setup of `enzyme` and `@testing-library/react` so instead of futzing
    // with it, we have a `shouldDereferenceOas` prop on this component that dictates if we should wrap `Doc` with
    // `DocAsync`.
    //
    // It's messy, but it at least lets us code tests for this component to be supplied dereferenced OAS definitions
    // while also having a functional server environment where async dereferencing is always enabled.
    return props => {
      if (shouldDereferenceOas) {
        return <DocAsync {...props} />;
      }

      return <Doc {...props} />;
    };
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

    if (!(apiSetting in this.oasInstances)) {
      this.oasInstances[apiSetting] = new Oas(this.props.oasFiles[apiSetting], this.props.variables.user);
    }

    return this.oasInstances[apiSetting];
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
    // Invoke supplementary handler (if available)
    this.props.onAuthGroupChange(group);

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

  openTutorialModal({ tutorial }) {
    const selectedTutorial = { ...cloneDeep(tutorial) };
    this.setState(() => ({ showTutorialModal: true, selectedTutorial }));
  }

  closeTutorialModal() {
    this.setState(() => ({ showTutorialModal: false, selectedTutorial: DEFAULT_TUTORIAL }));
  }

  renderTutorialModal() {
    const { selectedTutorial, showTutorialModal } = this.state;

    return (
      <TutorialModal
        action={'View'}
        baseUrl={this.props.baseUrl.replace(/\/$/, '')}
        closeTutorialModal={this.closeTutorialModal}
        moduleEnabled={true}
        open={showTutorialModal}
        target={'#tutorialmodal-root'}
        tutorial={selectedTutorial}
      />
    );
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
    const BaseUrlContext = require('@readme/markdown-magic/src/contexts/BaseUrl');
    const VariablesContext = require('@readme/variable/contexts/Variables');
    const GlossaryTermsContext = require('@readme/markdown-magic/src/contexts/GlossaryTerms');

    const { utils } = require('@readme/markdown');
    const NewBaseUrlContext = utils.BaseUrlContext;
    const NewVariablesContext = utils.VariablesContext;
    const NewGlossaryTermsContext = utils.GlossaryContext;
    /* eslint-enable global-require */

    return (
      <div className={`is-lang-${this.state.language}`}>
        {this.renderTutorialModal()}
        <div
          className={`content-body hub-reference-sticky hub-reference-theme-${this.props.appearance.referenceLayout}`}
          id="hub-reference"
        >
          {docs.map((doc, index) => (
            <VariablesContext.Provider key={index} value={this.props.variables}>
              <NewVariablesContext.Provider key={index} value={this.props.variables}>
                <TutorialVariableContext.Provider key={index} value={this.props.variables}>
                  <OauthContext.Provider value={this.props.oauth}>
                    <GlossaryTermsContext.Provider value={this.props.glossaryTerms}>
                      <NewGlossaryTermsContext.Provider value={this.props.glossaryTerms}>
                        <BaseUrlContext.Provider value={this.props.baseUrl.replace(/\/$/, '')}>
                          <NewBaseUrlContext.Provider value={this.props.baseUrl.replace(/\/$/, '')}>
                            <SelectedAppContext.Provider value={this.state.selectedApp}>
                              <this.DocComponent
                                key={doc._id}
                                appearance={this.props.appearance}
                                auth={this.state.auth}
                                baseUrl={this.props.baseUrl.replace(/\/$/, '')}
                                doc={doc}
                                enableRequestBodyJsonEditor={this.props.enableRequestBodyJsonEditor}
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
                                openTutorialModal={this.openTutorialModal}
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
                </TutorialVariableContext.Provider>
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
  enableRequestBodyJsonEditor: PropTypes.bool,
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
  onAuthGroupChange: PropTypes.func,
  onError: PropTypes.func,
  shouldDereferenceOas: PropTypes.bool,
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
  enableRequestBodyJsonEditor: false,
  flags: {
    correctnewlines: false,
    rdmdCompatibilityMode: false,
  },
  Logs: undefined,
  maskErrorMessages: true,
  oauth: false,
  onAuthGroupChange: () => {},
  onError: () => {},
  shouldDereferenceOas: true,
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
