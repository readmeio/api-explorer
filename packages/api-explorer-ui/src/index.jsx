const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('readme-oas-extensions');

const Doc = require('./Doc');

class ApiExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: 'curl' };

    try {
      const firstOas = Object.keys(this.props.oasFiles)[0];
      this.state.language = this.props.oasFiles[firstOas][extensions.SAMPLES_LANGUAGES][0];
    } catch (e) {} // eslint-disable-line no-empty

    this.setLanguage = this.setLanguage.bind(this);
  }
  setLanguage(language) {
    this.setState({ language });
  }
  render() {
    return (
      <div className={`is-lang-${this.state.language}`}>
        <div id="hub-reference">
          {
            this.props.docs.map(doc => (
              <Doc
                key={doc._id}
                doc={doc}
                oas={doc.category.apiSetting ? this.props.oasFiles[doc.category.apiSetting] : {}}
                setLanguage={this.setLanguage}
              />
              ),
            )
          }
        </div>
      </div>
    );
  }
}

ApiExplorer.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.object).isRequired,
  oasFiles: PropTypes.shape({}).isRequired,
};

module.exports = ApiExplorer;
