const React = require('react');
const Cookie = require('js-cookie');
const PropTypes = require('prop-types');
const extensions = require('../../readme-oas-extensions');

const Doc = require('./Doc');

class ApiExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: Cookie.get('readme_language') || this.getDefaultLanguage() };

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
              oas={doc.category.apiSetting && this.props.oasFiles[doc.category.apiSetting]}
              setLanguage={this.setLanguage}
              flags={this.props.flags}
              language={this.state.language}
              oauthUrl={this.props.oauthUrl}
              suggestedEdits={this.props.suggestedEdits}
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
  oauthUrl: PropTypes.string,
  suggestedEdits: PropTypes.bool.isRequired,
};

ApiExplorer.defaultProps = {
  oauthUrl: '',
  flags: PropTypes.shape({
    stripe: false,
  }),
};

module.exports = ApiExplorer;
