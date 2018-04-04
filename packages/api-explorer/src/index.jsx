const React = require('react');
const Cookie = require('js-cookie');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');

const Doc = require('./Doc');

class ApiExplorer extends React.Component {
  static getApiKey() {
    try {
      const userData = Cookie.getJSON('user_data');
      // TODO: This needs to work for legacy api_key
      // as well as keys[].apiKey
      return userData.apiKey || userData.keys[0].api_key;
    } catch (e) {
      return undefined;
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      language: Cookie.get('readme_language') || this.getDefaultLanguage(),
      apiKey: ApiExplorer.getApiKey(),
    };

    this.setLanguage = this.setLanguage.bind(this);
    this.getDefaultLanguage = this.getDefaultLanguage.bind(this);
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
    // Get the apiSetting id either from the category, or the api if api is set
    // This will return undefined if apiSetting is not set
    const apiSetting = doc.category.apiSetting || (doc.api.apiSetting && doc.api.apiSetting._id);

    return this.props.oasFiles[apiSetting];
  }
  render() {
    const theme = this.props.flags.stripe ? 'stripe' : '';
    return (
      <div className={`is-lang-${this.state.language}`}>
        <div
          id="hub-reference"
          className={`content-body hub-reference-sticky hub-reference-theme-${theme}`}
        >
          {this.props.docs.map(doc => (
            <Doc
              key={doc._id}
              doc={doc}
              oas={this.getOas(doc)}
              setLanguage={this.setLanguage}
              flags={this.props.flags}
              language={this.state.language}
              oauth={this.props.oauth}
              suggestedEdits={this.props.suggestedEdits}
              apiKey={this.state.apiKey}
            />
          ))}
        </div>
      </div>
    );
  }
}

ApiExplorer.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.object).isRequired,
  oasFiles: PropTypes.shape({}).isRequired,
  flags: PropTypes.shape({
    stripe: PropTypes.bool,
  }).isRequired,
  oauth: PropTypes.bool,
  suggestedEdits: PropTypes.bool.isRequired,
};

ApiExplorer.defaultProps = {
  oauth: false,
  flags: { stripe: false },
};

module.exports = ApiExplorer;
