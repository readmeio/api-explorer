/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unused-prop-types */
import React, {Fragment} from 'react'
import Waypoint from 'react-waypoint'

import PropTypes from 'prop-types'
import {Icon} from 'antd'
import fetchHar from 'fetch-har'

import {get} from 'lodash'
import extensions from '@mia-platform/oas-extensions'

import oasToHar from './lib/oas-to-har'
import isAuthReady from './lib/is-auth-ready'

import ContentWithTitle from './components/ContentWithTitle'
import Select from './components/Select'
import colors from './colors';

const PathUrl = require('./PathUrl');
const createParams = require('./Params');
const CodeSample = require('./CodeSample');
const Response = require('./components/Response');
const ResponseSchema = require('./ResponseSchema');
const ErrorBoundary = require('./ErrorBoundary');
const markdown = require('@mia-platform/markdown');

const Oas = require('./lib/Oas');
const parseResponse = require('./lib/parse-response');
const getContentTypeFromOperation = require('./lib/get-content-type')


function Description({doc, suggestedEdits, baseUrl}){
  return(
    <div style={{display: 'flex', flexDirection: 'column'}}>
      {suggestedEdits && (
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <a
            style={{fontSize: 14, color: colors.suggestEdit, textTransform: 'uppercase'}}
            href={`${baseUrl}/reference-edit/${doc.slug}`}
          >
            <span style={{marginRight: 5}}>Suggest Edits</span><Icon type="edit" />
          </a>
        </div>
        )} 
      <ContentWithTitle
        title={'Description'}
        content={doc.excerpt ? <div>{markdown(doc.excerpt)}</div> : 'Description not available'}
        showDivider={false}
        theme={'dark'}
        showBorder={false}
        titleUpperCase
      />
    </div>
    )
}

class Doc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      dirty: false,
      loading: false,
      showAuthBox: false,
      needsAuth: false,
      result: null,
      showEndpoint: false,
      auth: null,
      error: false,
      selectedContentType: undefined,
    };
    this.onChange = this.onChange.bind(this);
    this.oas = new Oas(this.props.oas, this.props.user);
    this.onSubmit = this.onSubmit.bind(this);
    this.toggleAuth = this.toggleAuth.bind(this);
    this.hideResults = this.hideResults.bind(this);
    this.waypointEntered = this.waypointEntered.bind(this);
    this.Params = createParams(this.oas);
    this.onAuthReset = this.onAuthReset.bind(this)
  }

  onChange(formData) {
    this.setState(previousState => {
      return {
        formData: Object.assign({}, previousState.formData, formData),
        dirty: true,
      };
    });
  }

  onSubmit() {
    const {auth} = this.state
    const operation = this.getOperation();
    if (!isAuthReady(operation, this.props.auth)) {
      this.setState({ showAuthBox: true });
      setTimeout(() => {
        this.authInput.focus();
        this.setState({ needsAuth: true });
      }, 600);
      return false;
    }
    this.setState({ loading: true, showAuthBox: false, needsAuth: false });

    const har = oasToHar(this.oas, operation, this.state.formData, auth || this.props.auth, {
      proxyUrl: true,
    });

    return fetchHar(har).then(async res => {
      this.props.tryItMetrics(har, res);

      this.setState({
        loading: false,
        result: await parseResponse(har, res),
        error: false
      });
    }).catch(() => {
      this.setState({
        loading: false,
        error: true
      })
    });
  }

  onAuthChange(auth) {
    this.setState(prevState => {
      return {
        auth: {...prevState.auth, ...auth}
      }
    })
  }

  onAuthReset(){
    this.setState({auth: null})
  }
  
  getOperation() {
    if (this.operation) return this.operation;

    const { doc } = this.props;
    const operation = doc.swagger ? this.oas.operation(doc.swagger.path, doc.api.method) : null;
    this.operation = operation;
    return operation;
  }

  getCurrentAuth() {
    return this.state.auth || this.props.auth
  }

  toggleAuth(e) {
    e.preventDefault();
    this.setState({ showAuthBox: !this.state.showAuthBox });
  }

  hideResults() {
    this.setState({ result: null });
  }

  waypointEntered() {
    this.setState({ showEndpoint: true });
  }

  renderContentTypeSelect(showTitle = false) {
    const list = getContentTypeFromOperation(this.getOperation())
    const renderSelect = () => {
      return (<Select
        value={this.state.selectedContentType}
        options={list}
        onChange={value => this.setState({selectedContentType: value})} 
      />)
    }

    return list && list.length !== 0 && showTitle ? (
      <ContentWithTitle
        title='Select Content Type'
        showBorder={false}
        showDivider={false}
        theme={'dark'}
        titleUpperCase
        content={renderSelect()}
      />
    ) : renderSelect()
  }

  renderCodeAndResponse() {
    const definitionStyle = {
      color: 'white',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }

    return(
      <div style={{display: 'grid', gridGap: '8px', gridTemplateColumns: '100%'}}>
        <ContentWithTitle 
          title={'Definition'} 
          showBorder={false}
          content={
            this.oas.servers && (
              <span style={definitionStyle}>
                {this.oas.servers[0].url}{this.getOperation().path}
              </span>
            )
          } 
        />
        <ContentWithTitle 
          title={'Examples'} 
          subheader={this.renderContentTypeSelect()} 
          content={this.renderCodeSample()} 
        />
        <ContentWithTitle 
          title={'Results'}  
          content={this.renderResponse()} 
        />
      </div>
    )
  }

  renderCodeSample() {
    const {selectedContentType} = this.state
    const examples = get(this.props, 'doc.api.examples.codes', [])

    return (
      <CodeSample
        oas={this.oas}
        setLanguage={this.props.setLanguage}
        operation={this.getOperation()}
        formData={this.state.formData}
        auth={this.getCurrentAuth()}
        language={this.props.language}
        examples={examples}
        selectedContentType={selectedContentType}
      />
    );
  }

  renderResponse() {
    return (
      <Response
        result={this.state.result}
        operation={this.getOperation()}
        oauth={this.props.oauth}
        hideResults={this.hideResults}
      />
    );
  }

  renderResponseSchema(theme = 'light') {
    const operation = this.getOperation();

    return (
      operation &&
      operation.responses && (
        <ResponseSchema theme={theme} operation={this.getOperation()} oas={this.oas} />
      )
    )
  }

  // eslint-disable-next-line class-methods-use-this
  renderContentWithUpperTitle(title, content) {
    return(
      <ContentWithTitle
        title={title}
        content={content}
        showDivider={false}
        theme={'dark'}
        showBorder={false}
        titleUpperCase
      />
    )
  }

  renderEndpoint() {
    const { doc, suggestedEdits, baseUrl } = this.props
    return (
        doc.type === 'endpoint' ? (
          <Fragment>
            <div style={{display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: 'min-content', gridGap: '16px', paddingRight: '16px'}}>
              {this.renderPathUrl()}  
              <Description 
                doc={doc} 
                suggestedEdits={suggestedEdits}  
                baseUrl={baseUrl}
              />
              {this.renderLogs()}
              {this.renderParams()}
              {this.renderContentTypeSelect(true)}
              {this.renderResponseSchema()}
            </div>
            <div
              style={{
                  padding: 8,
                  border: `1px solid ${colors.codeAndResponseBorder}`,
                  background: colors.codeAndResponseBackground
                }}
            > 
              {this.renderCodeAndResponse()}
            </div>
          </Fragment>
        ) : null
    );
  }

  renderLogs() {
    if (!this.props.Logs) return null;
    const { Logs } = this.props;
    const operation = this.getOperation();
    const { method } = operation;
    const url = `${this.oas.url()}${operation.path}`;

    return (
      <Logs
        user={this.props.user}
        baseUrl={this.props.baseUrl}
        query={{
          url,
          method,
        }}
      />
    );
  }

  renderParams() {
    return (
      <this.Params
        oas={this.oas}
        operation={this.getOperation()}
        formData={this.state.formData}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
      />
    );
  }

  renderPathUrl() {
    const {error} = this.state
    return (
      <PathUrl
        oas={this.oas}
        operation={this.getOperation()}
        dirty={this.state.dirty}
        loading={this.state.loading}
        onChange={(auth) => this.onAuthChange(auth)}
        showAuthBox={this.state.showAuthBox}
        needsAuth={this.state.needsAuth}
        oauth={this.props.oauth}
        toggleAuth={this.toggleAuth}
        onSubmit={this.onSubmit}
        authInputRef={el => {
          // eslint-disable-next-line no-return-assign
          return (this.authInput = el);
        }}
        auth={this.getCurrentAuth()}
        error={error}
        onReset={this.onAuthReset}
        showReset={this.state.auth !== null}
      />
    );
  }

  render() {
    const { doc } = this.props;
    const oas = this.oas;

    const renderEndpoint = () => {
      if (this.props.appearance.splitReferenceDocs) return this.renderEndpoint();

      return (
        <Waypoint onEnter={this.waypointEntered} fireOnRapidScroll={false} bottomOffset="-1%">
          {this.state.showEndpoint && this.renderEndpoint()}
        </Waypoint>
      );
    };

    return (
      <ErrorBoundary>
        <div id={`page-${doc.slug}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px'}}>
            {renderEndpoint()}
          </div>
          {
          // TODO maybe we dont need to do this with a hidden input now
          // cos we can just pass it around?
          }
          <input
            type="hidden"
            id={`swagger-${extensions.SEND_DEFAULTS}`}
            value={oas[extensions.SEND_DEFAULTS]}
          />
        </div>
      </ErrorBoundary>
    );
  }
}

module.exports = Doc;

Doc.propTypes = {
  doc: PropTypes.shape({
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    slug: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    api: PropTypes.shape({
      method: PropTypes.string.isRequired,
      examples: PropTypes.shape({
        codes: PropTypes.arrayOf(
          PropTypes.shape({
            language: PropTypes.string.isRequired,
            code: PropTypes.string.isRequired,
          }),
        ),
      }),
      results: PropTypes.shape({
        codes: PropTypes.arrayOf(
          PropTypes.shape({}), // TODO: Jsinspect threw an error because this was too similar to L330
        ),
      }),
    }),
    swagger: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }),
  }).isRequired,
  user: PropTypes.shape({}),
  auth: PropTypes.shape({}).isRequired,
  Logs: PropTypes.func,
  oas: PropTypes.shape({}),
  setLanguage: PropTypes.func.isRequired,
  flags: PropTypes.shape({
    correctnewlines: PropTypes.bool,
  }).isRequired,
  appearance: PropTypes.shape({
    referenceLayout: PropTypes.string,
    splitReferenceDocs: PropTypes.bool,
  }).isRequired,
  language: PropTypes.string.isRequired,
  baseUrl: PropTypes.string,
  oauth: PropTypes.bool.isRequired,
  suggestedEdits: PropTypes.bool.isRequired,
  tryItMetrics: PropTypes.func.isRequired,
  onAuthChange: PropTypes.func.isRequired,
};

Doc.defaultProps = {
  oas: {},
  flags: {
    correctnewlines: false,
  },
  appearance: {
    referenceLayout: 'row',
    splitReferenceDocs: false,
  },
  Logs: undefined,
  user: undefined,
  baseUrl: '/',
};
