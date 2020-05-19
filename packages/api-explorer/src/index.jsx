/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import { Collapse, Tag, Divider } from 'antd';
import get from 'lodash.get'
import extensions from '@mia-platform/oas-extensions'

import { IntlProvider, addLocaleData } from 'react-intl';
import itLocale from 'react-intl/locale-data/it';
import enLocale from 'react-intl/locale-data/en';
import it from "../i18n/it.json";
import en from "../i18n/en.json";

import colors from './colors'
import './code-mirror.css'

import Doc from './Doc'

const Panel = Collapse.Panel

const Cookie = require('js-cookie');
const PropTypes = require('prop-types');

const VariablesContext = require('@mia-platform/variable/contexts/Variables');
const OauthContext = require('@mia-platform/variable/contexts/Oauth');
const GlossaryTermsContext = require('@mia-platform/markdown/contexts/GlossaryTerms');
const SelectedAppContext = require('@mia-platform/variable/contexts/SelectedApp');
const markdown = require('@mia-platform/markdown');

const getAuth = require('./lib/get-auth');
const ErrorBoundary = require('./ErrorBoundary');

addLocaleData([...itLocale, ...enLocale]);
const messages = {
  it, en,
}

function getDescription(oasFiles){
  return get(oasFiles, 'api-setting.info.description')
}

class ApiExplorer extends React.Component {
  constructor(props) {
    super(props);

    this.setLanguage = this.setLanguage.bind(this);
    this.getDefaultLanguage = this.getDefaultLanguage.bind(this);
    this.changeSelected = this.changeSelected.bind(this);
    this.state = {
      language: Cookie.get('readme_language') || this.getDefaultLanguage(),
      selectedApp: {
        selected: '',
        changeSelected: this.changeSelected,
      },
      description: getDescription(this.props.oasFiles),
    };
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

    const oasFromProps = this.props.oasFiles[apiSetting]
    let oas
    if (oasFromProps) {
      const extensionDefault = Object.assign({}, extensions.defaults)
      const xSampleLanguages = extensionDefault[extensions.SAMPLES_LANGUAGES]
      oas = {
        ...oasFromProps,
        [extensions.SAMPLES_LANGUAGES]: xSampleLanguages
      }
    }
    return oas;
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
        <div id="oas-initial-description" style={style}>{markdown(description)}</div> :
        null
    )
  }

  renderDoc(doc) {
    const {variables: {user}, oasFiles} = this.props
    const auth = getAuth(user, oasFiles)
    return (
      <Doc
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
        tryItMetrics={this.props.tryItMetrics}
        auth={auth}
        fallbackUrl={this.props.fallbackUrl}
        stripSlash={this.props.stripSlash}
      />
    )
  }

  // eslint-disable-next-line class-methods-use-this
  renderHeaderPanel(doc) {
    const swagger = doc.swagger
    const tagStyle = {
      textTransform: 'uppercase',
      color: colors.defaultTag,
      fontWeight: 600,
    }
    const uriStyle = {
      color: colors.bold,
      fontFamily: 'monospace',
    }

    const colorStyle = colors[doc.api.method]
    const borderColor = colorStyle ? colorStyle.border : colors.defaultBorder
    const method = <Tag color={borderColor} style={tagStyle}>{doc.api.method}</Tag>
    return(
      <div>
        {method}
        <b style={uriStyle}>
          {swagger && swagger.path}
        </b>
        <Divider type="vertical" />
        {doc.title}
      </div>
    )
  }

  render() {
    const styleByMethod = (method) => ({
      backgroundColor: colors[method] ? colors[method].bg : colors.defaultBackground,
      border: `1px solid ${colors[method] ? colors[method].border : colors.defaultBorder}`,
    })

    const panelStyle = {
      margin: '5px 0px',
      borderRadius: 5,
      overflow: 'hidden',
    }

    const defaultOpenDoc = this.props.defaultOpenDoc ? this.props.defaultOpenDoc : '0'
    const defaultOpen = this.props.defaultOpen ? [defaultOpenDoc] : null
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
                <div className={`is-lang-${this.state.language}`}>
                  {this.props.showOnlyAPI ? null : this.renderDescription()}
                  <div
                    id="hub-reference"
                    className={`content-body hub-reference-sticky hub-reference-theme-${this.props.appearance.referenceLayout}`}
                    style={{padding: 16}}
                  >
                    <Collapse
                      defaultActiveKey={defaultOpen}
                      style={{background: 'none', border: 'none'}}
                      accordion
                      onChange={this.props.onDocChange}
                    >
                      {this.props.docs.map((doc) => (
                        <Panel
                          header={this.renderHeaderPanel(doc)}
                          key={`${doc.api.method}-${doc.swagger.path}`}
                          style={{...styleByMethod(doc.api.method), ...panelStyle}}
                          forceRender={this.props.forcePanelRender}
                        >
                          {this.renderDoc(doc)}
                        </Panel>
                      ))}
                    </Collapse>
                  </div>
                </div>
              </SelectedAppContext.Provider>
            </GlossaryTermsContext.Provider>
          </OauthContext.Provider>
        </VariablesContext.Provider>
      </IntlProvider>
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
    locale: PropTypes.string.isRequired,
    defaultLocale: PropTypes.string.isRequired,
  }),
  showOnlyAPI: PropTypes.bool,
  defaultOpen: PropTypes.bool,
  defaultOpenDoc: PropTypes.string,
  onDocChange: PropTypes.func,
  fallbackUrl: PropTypes.string,
  stripSlash: PropTypes.bool,
  forcePanelRender: PropTypes.bool,
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
  showOnlyAPI: false,
  defaultOpen: true,
  defaultOpenDoc: '',
  onDocChange: () => {},
  fallbackUrl: '',
  stripSlash: false,
  forcePanelRender: false,
};

module.exports = props => (
  <ErrorBoundary>
    <ApiExplorer {...props} />
  </ErrorBoundary>
);
module.exports.ApiExplorer = ApiExplorer;
