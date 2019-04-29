import React, {Fragment} from 'react'

import PropTypes from 'prop-types'
import {Icon} from 'antd'
import fetchHar from 'fetch-har'

import oasToHar from './lib/oas-to-har'
import isAuthReady from './lib/is-auth-ready'
import extensions from '@readme/oas-extensions'
import Waypoint from 'react-waypoint'
import {get} from 'lodash'

import ContentWithTitle from './components/ContentWithTitle'
import Select from './components/Select'
import colors from './colors';

const PathUrl = require('./PathUrl');
const createParams = require('./Params');
const CodeSample = require('./CodeSample');
const Response = require('./components/Response');
const ResponseSchema = require('./ResponseSchema');
const EndpointErrorBoundary = require('./EndpointErrorBoundary');
const markdown = require('@readme/markdown');

const Oas = require('./lib/Oas');
// const showCode = require('./lib/show-code');
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
      selectedContentType: null,
      error: false
    };
    this.onChange = this.onChange.bind(this);
    this.oas = new Oas(this.props.oas, this.props.user);
    this.onSubmit = this.onSubmit.bind(this);
    this.toggleAuth = this.toggleAuth.bind(this);
    this.hideResults = this.hideResults.bind(this);
    this.waypointEntered = this.waypointEntered.bind(this);
    this.Params = createParams(this.oas);
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

    const har = oasToHar(this.oas, operation, this.state.formData, this.props.auth, {
      proxyUrl: true,
    });

    return fetchHar(har).then(async res => {
      this.props.tryItMetrics(har, res);

      this.setState({
        loading: false,
        result: await parseResponse(har, res),
        error: false
      });
    }).catch(e => {
      this.setState({
        loading: false,
        error: true
      })
    });
  }

  getOperation() {
    if (this.operation) return this.operation;

    const { doc } = this.props;
    const operation = doc.swagger ? this.oas.operation(doc.swagger.path, doc.api.method) : null;
    this.operation = operation;
    return operation;
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

  renderContentTypeSelect(){
    const list = getContentTypeFromOperation(this.getOperation())
    return <Select options={list} onChange={(e) => this.setState({selectedContentType: e.currentTarget.value})} />
  }

  renderCodeAndResponse() {
    return(
      <div style={{display: 'grid', gridGap: '8px', gridTemplateColumns: '100%'}}>
        <ContentWithTitle 
          title={'Description'} 
          showBorder={false}
          content={
            <span style={{color: 'white'}}>
              {this.oas.servers[0].url}{this.getOperation().path}
            </span>
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
        auth={this.props.auth}
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
              {this.renderResponseSchema()}
            </div>
            <div
              style={{
                  padding: 8,
                  border: '1px solid #0f0f0f',
                  background: 'rgb(51, 55, 58)'
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
        onChange={this.props.onAuthChange}
        showAuthBox={this.state.showAuthBox}
        needsAuth={this.state.needsAuth}
        oauth={this.props.oauth}
        toggleAuth={this.toggleAuth}
        onSubmit={this.onSubmit}
        authInputRef={el => (this.authInput = el)}
        auth={this.props.auth}
        error={error}
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
      <EndpointErrorBoundary>
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
      </EndpointErrorBoundary>
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
