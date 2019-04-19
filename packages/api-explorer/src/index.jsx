import 'antd/dist/antd.css';
import { Collapse } from 'antd';

const {Panel} = Collapse

const React = require('react');
const Cookie = require('js-cookie');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const VariablesContext = require('@readme/variable/contexts/Variables');
const OauthContext = require('@readme/variable/contexts/Oauth');
const GlossaryTermsContext = require('@readme/markdown/contexts/GlossaryTerms');
const SelectedAppContext = require('@readme/variable/contexts/SelectedApp');
const {get} = require('lodash')
const markdown = require('@readme/markdown');

const ErrorBoundary = require('./ErrorBoundary');
const Doc = require('./Doc');

const getAuth = require('./lib/get-auth');

function getDescription(oasFiles){
  return get(oasFiles, 'api-setting.info.description')
}
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
      description: getDescription(this.props.oasFiles)
    };
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

  changeSelected(selected) {
    this.setState({ selectedApp: { selected, changeSelected: this.changeSelected } });
  }

  renderDescription(){
    const style = {
      maxHeight: 300,
      overflowY: 'auto',
      margin: '10px',
      border: '1px solid',
      padding: '10px',
      background: '#33373a'
    }
    return(
      <div style={style}>{markdown(this.state.description)}</div>
    )
  }

  renderDoc(doc){
    return(
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
          </GlossaryTermsContext.Provider>
        </OauthContext.Provider>
      </VariablesContext.Provider>
    )
  }
  render() {
    return (
      <div className={`is-lang-${this.state.language}`}>
        {this.renderDescription()}
        <div
          id="hub-reference"
          className={`content-body hub-reference-sticky hub-reference-theme-${this.props.appearance
            .referenceLayout}`}
          style={{padding: 16}}
        >
          <Collapse
            defaultActiveKey={['0']}
          >
            {this.props.docs.map((doc, index) => (
              <Panel header={`${doc.api.method} ${this.getOas(doc).servers[0].url}${doc.swagger.path} ${doc.title}`} key={index}>
                {this.renderDoc(doc)}
              </Panel>
          ))}
          </Collapse>
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
