import React from 'react'
import {FormattedMessage} from 'react-intl';

import BlockWithTab from './components/BlockWithTab'
import CopyCode from './components/CopyCode'
import colors from './colors';

const PropTypes = require('prop-types');
const extensions = require('@mia-platform/oas-extensions');
const Oas = require('./lib/Oas');

const { Operation } = Oas;

const generateCodeSnippet = require('./lib/generate-code-snippet');

class CodeSample extends React.Component {
  constructor(props) {
    super(props);

    const { examples, language } = props;
    const selectedExample = examples.find(example => example.language === language);

    this.state = {
      selectedExample,
    };
  }

  getKey(example, index) {
    const key = `${example.language}-${index}`;
    let selected = this.state.selectedExample === example;
    if (!this.state.selectedExample && index === 0) {
      selected = true;
    }
    return { key, selected };
  }

  selectExample(example) {
    this.setState({ selectedExample: example });
  }

  renderCodeWithListSection(snippet, code, languagesList, setLanguage) {
    const {language} = this.props
    const ctaContainerStyle = {
      borderTop: '2px solid #fff',
      display: 'flex',
      padding: '5px',
      paddingRight: '10px',
      paddingBottom: '0px',
    }
    const snippetStyle = {
      fontSize: 12,
      fontFamily: 'Monaco, "Lucida Console", monospace',
      border: 0,
      background: 'transparent',
      padding: '0 30px',
      overflow: 'visible',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      color: colors.snippet
    }
    const langItems = languagesList.map(lang => ({value: lang, label: generateCodeSnippet.getLangName(lang)}))
    return(
      <BlockWithTab
        items={langItems}
        selected={language}
        onClick={setLanguage}
      >
        <div style={ctaContainerStyle}>
          <CopyCode code={code} />
        </div>
        {
          snippet && (
          <div style={{maxHeight: '400px', overflow: 'hidden scroll'}}>
            <pre className={`tomorrow-night hub-lang hub-lang-${language}`} style={snippetStyle}>{snippet}</pre>
          </div>
          )
        }
      </BlockWithTab>
    )
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { oas, setLanguage, operation, formData, language, examples, auth,  selectedContentType} = this.props;
    return (
      <div className="tabber-parent">
        {(() => {
          // if (examples.length) return this.renderSelected(examples, setLanguage); I think we don't need this (Riccardo Di Benedetto)
          if (!oas[extensions.SAMPLES_ENABLED]) {
            return (
              <div className="hub-no-code">
                <FormattedMessage
                  id="code.sample.na"
                  defaultMessage="No code samples available"
                />
              </div>
            );
          }
          const { snippet, code } = generateCodeSnippet(oas, operation, formData, auth, language, selectedContentType);
          const languagesList = oas[extensions.SAMPLES_LANGUAGES]
          return (
            this.renderCodeWithListSection(snippet, code, languagesList, setLanguage)
          );
        })()}
      </div>
    );
  }
}

CodeSample.propTypes = {
  oas: PropTypes.instanceOf(Oas).isRequired,
  setLanguage: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  formData: PropTypes.shape({}).isRequired,
  auth: PropTypes.shape({}).isRequired,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    }),
  ),
  language: PropTypes.string.isRequired,
  selectedContentType: PropTypes.string
};

CodeSample.defaultProps = {
  examples: [],
  selectedContentType: '',
};

module.exports = CodeSample;
