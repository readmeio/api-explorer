/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import { Collapse, Tag } from 'antd';
import get from 'lodash.get'

import { IntlProvider, addLocaleData } from 'react-intl';
import itLocale from 'react-intl/locale-data/it';
import enLocale from 'react-intl/locale-data/en';
import it from "../i18n/it.json";
import en from "../i18n/en.json";

import colors from './colors'

addLocaleData([...itLocale, ...enLocale]);
const messages = {
  it, en,
}

const Panel = Collapse.Panel

const Cookie = require('js-cookie');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const VariablesContext = require('@readme/variable/contexts/Variables');
const OauthContext = require('@readme/variable/contexts/Oauth');
const GlossaryTermsContext = require('@readme/markdown/contexts/GlossaryTerms');
const SelectedAppContext = require('@readme/variable/contexts/SelectedApp');
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
      background: colors.descriptionBackground,
      fontSize: 14,
      lineHeight: '24px',
      color: colors.descriptionText
    }
    const {description} = this.state
    return(
      description ?
        <div style={style}>{markdown(description)}</div> :
        null
    )
  }

  renderDoc(doc) {
    const localizedMessages = messages[this.props.i18n.locale] || messages[this.props.i18n.defaultLocale]
    return (
      <IntlProvider
        locale={this.props.i18n.locale}
        defaultLocale={this.props.i18n.defaultLocale}
        messages={localizedMessages}
      >
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
                  suggestedEdits={false}
                  tryItMetrics={this.props.tryItMetrics}
                  auth={this.state.auth}
                  onAuthChange={this.onAuthChange}
                />
              </SelectedAppContext.Provider>
            </GlossaryTermsContext.Provider>
          </OauthContext.Provider>
        </VariablesContext.Provider>
      </IntlProvider>
    )
  }

  renderHeaderPanel(doc) {
    const oas = this.getOas(doc)
    const swagger = doc.swagger

    const tagStyle = {
      textTransform: 'uppercase',
      color: colors.defaultTag,
      fontWeight: 600,
    }

    const method = <Tag color={colors[doc.api.method].border} style={tagStyle}>{doc.api.method}</Tag>
    return(
      <div>
        {method} <b style={{color: colors.bold}}>
          {oas && oas.servers[0].url}
          {swagger && swagger.path}
        </b> {doc.title}
      </div>    
    )
  }

  render() {
    const styleByMethod = (method) => ({
      backgroundColor: colors[method].bg, 
      border: `1px solid ${colors[method].border}`,
    })

    const panelStyle = {
      margin: '5px 0px',
      borderRadius: 5,
      overflow: 'hidden',
    }
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
            style={{background: 'none', border: 'none'}}
            accordion
          >
            {this.props.docs.map((doc, index) => (
              <Panel header={this.renderHeaderPanel(doc)} style={{...styleByMethod(doc.api.method), ...panelStyle}} key={index}>
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
  i18n: PropTypes.shape({
    locale: PropTypes.string,
    defaultLocale: PropTypes.string,
  }), 
};

ApiExplorer.defaultProps = {
  oauth: false,
  flags: {
    correctnewlines: false,
  },
  tryItMetrics: () => {},
  Logs: undefined,
  baseUrl: '/',
  i18n: {
    locale: 'en',
    defaultLocale: 'en',
  },
};

module.exports = props => (
  <ErrorBoundary>
    <ApiExplorer {...props} />
  </ErrorBoundary>
);
module.exports.ApiExplorer = ApiExplorer;
