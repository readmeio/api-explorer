/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unused-prop-types */
import React, {Fragment} from 'react'
import {FormattedMessage} from 'react-intl'
import PropTypes from 'prop-types'
import fetchHar from 'fetch-har'
import get from 'lodash.get'
import {clone} from 'ramda'
import {Button} from 'antd';

import extensions from '@mia-platform/oas-extensions'

import fetchMultipart from './lib/fetch-multipart'
import oasToHar from './lib/oas-to-har'
import isAuthReady from './lib/is-auth-ready'
import filterEmptyFormData from './lib/filter-empty-formdata';

import ContentWithTitle from './components/ContentWithTitle'
import SchemaTabs from './components/SchemaTabs'
import Select from './components/Select'
import colors from './colors';
import Params from './Params'
import ViewMode from './context/ViewMode'
import ViewOnlyMode from './components/ViewOnlyMode'
import docPropTypes from './prop-types/doc'

const PathUrl = require('./PathUrl');
const CodeSample = require('./CodeSample');
const Response = require('./components/Response');
const ErrorBoundary = require('./ErrorBoundary');
const markdown = require('@mia-platform/markdown');

const Oas = require('./lib/Oas');
const parseResponse = require('./lib/parse-response');
const getContentTypeFromOperation = require('./lib/get-content-type')
const { getAuthPerPath } = require('./lib/get-auth')

function Description({doc}) {
  const description = <FormattedMessage id={'doc.description'} defaultMessage={'Description'} />
  const descriptionNa = <FormattedMessage id={'doc.description.na'} defaultMessage={'Description not available'} />
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <ContentWithTitle
        title={description}
        content={doc.excerpt ? <div>{markdown(doc.excerpt)}</div> : descriptionNa}
        showDivider={false}
        theme={'dark'}
        showBorder={false}
        titleUpperCase
      />
    </div>
  )
}

const styles = {
  renderCodeAndResponseWrapper: {
    border: `1px solid ${colors.codeAndResponseBorder}`,
    background: colors.codeAndResponseBackground
  },
  renderCodeAndResponseTitleWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  renderCodeAndResponseTitle: {
    display: 'flex',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  renderCodeAndResponseTitleButton: {
    backgroundColor: 'unset',
    height: 32,
    display: 'flex',
    alignItems: 'center',
    color: colors.white,
    border: 'none'
  },
  definitionStyle: {
    padding: 8,
    color: colors.white,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'monospace',
  },
  endpointWrapperStyle: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'repeat(auto-fit, minmax(50px, min-content))',
    gridGap: 8,
    paddingRight: '16px',
    minWidth: 0,
  }
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
      auth: null,
      error: false,
      selectedContentType: undefined,
      isCollapse: true
    };
    this.onChange = this.onChange.bind(this);
    const oas = new Oas(this.props.oas, this.props.user);
    if (!oas.servers || oas.servers.length === 0 && this.props.fallbackUrl) {
      oas.servers = [{url: this.props.fallbackUrl}]
    }
    this.oas = oas;

    this.onSubmit = this.onSubmit.bind(this);
    this.toggleAuth = this.toggleAuth.bind(this);
    this.hideResults = this.hideResults.bind(this);
    this.onAuthReset = this.onAuthReset.bind(this);
    this.setFormSubmissionListener = this.setFormSubmissionListener.bind(this);
    this.formSubmitSubscribers = [];

    const list = getContentTypeFromOperation(this.getOperation())
    if (list && list.length > 0) {
      this.state.selectedContentType = list[0]
    }
    if (this.getOperation() && this.getOperation().securityDefinitions) {
      this.state.auth = getAuthPerPath(this.props.user, this.getOperation().securityDefinitions)
    }
  }

  onChange(data) {
    this.setState(previousState => {
      const { schema, formData } = data

      if (!get(schema, 'type') || !get(formData, [schema.type])) {
        return {}
      }

      const typeFromSchema = schema.type
      const schemaForFilterEmptyFormData = schema.schema
      const formDataToFilter = formData[typeFromSchema]
      const filtered = filterEmptyFormData(clone(formDataToFilter), schemaForFilterEmptyFormData)
      return {
        formData: Object.assign({}, previousState.formData, {[typeFromSchema]: filtered}),
        dirty: true
      }
    });
  }

  onSubmit() {
    if (this.formSubmitSubscribers && this.formSubmitSubscribers.length > 0) {
      try {
        this.formSubmitSubscribers.forEach(subscriber => subscriber.onFormSubmission())
      } catch(e) {
        // eslint-disable-next-line no-console
        console.error('Form submission interrupted:', e.message)
        return false
      }
    }

    const {auth, selectedContentType} = this.state
    const operation = this.getOperation();
    if (!isAuthReady(operation, auth || this.props.auth)) {
      this.setState({ showAuthBox: true });
      setTimeout(() => {
        if (this.authInput && this.authInput.focus) {
          this.authInput.focus();
        }
        this.setState({ needsAuth: true });
      });
      return false;
    }
    this.setState({ loading: true, showAuthBox: false, needsAuth: false });

    const har = oasToHar(this.oas, operation, this.state.formData, auth || this.props.auth, {
      proxyUrl: true,
    }, selectedContentType);

    const switchFetchOnContentType = (contentType) => {
      if (contentType === 'multipart/form-data') {
        return fetchMultipart(har, this.state.formData)
      }
      return fetchHar(har)
    }

    return switchFetchOnContentType(selectedContentType)
      .then(async res => {
        this.props.tryItMetrics(har, res);
        const parsedResponse = await parseResponse(har, res)

        this.setState({
          loading: false,
          result: parsedResponse,
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

  setFormSubmissionListener(listener) {
    this.formSubmitSubscribers.push(listener)
  }

  getOperation() {
    if (this.operation) return this.operation;
    const { doc, stripSlash } = this.props;
    const operation = doc.swagger ? this.oas.operation(doc.swagger.path, doc.api.method, stripSlash) : null;
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
        title={<FormattedMessage id={`doc.selectContentType`} defaultMessage={'Select Content Type'} />}
        showBorder={false}
        showDivider={false}
        theme={'dark'}
        titleUpperCase
        content={renderSelect()}
      />
    ) : renderSelect()
  }

  renderCodeAndResponse() {
    const {isCollapse} = this.state
    const title = (
      <div style={styles.renderCodeAndResponseTitleWrapper}>
        <div style={styles.renderCodeAndResponseTitle}>
          <Button
            icon={isCollapse ? 'import': 'export'}
            onClick={() => this.setState(currentState => ({isCollapse: !currentState.isCollapse}))}
            style={styles.renderCodeAndResponseTitleButton}
          >
            <FormattedMessage
              id={isCollapse ? 'doc.expand' : 'doc.collapse'}
              defaultMessage={isCollapse ? 'expand' : 'collapse'}
            />
          </Button>
        </div>
        <div style={{padding: 8}}>
          <FormattedMessage id={'doc.definition'} defaultMessage={'Definition'} />
        </div>
      </div>
    )
    const operation = this.getOperation()
    return(
      <div style={{display: 'grid', gridGap: '8px', gridTemplateColumns: '100%'}}>
        <ContentWithTitle
          title={title}
          showBorder={false}
          content={this.oas.servers && (
            <span style={styles.definitionStyle}>
              {this.oas.servers[0].url}{operation ? operation.path : ''}
            </span>
          )}
        />
        <div style={{padding: 8}}>
          <ContentWithTitle
            title={<FormattedMessage id={'doc.examples'} defaultMessage={'Examples'} />}
            subheader={this.renderContentTypeSelect()}
            content={this.renderCodeSample()}
          />
          <ContentWithTitle
            title={<FormattedMessage id={'doc.results'} defaultMessage={'Results'} />}
            content={this.renderResponse()}
          />
        </div>
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
        style={styles}
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

  renderSchemaTab() {
    const operation = this.getOperation()
    if(!operation){
      return null
    }
    return(
      <SchemaTabs operation={this.getOperation()} oas={this.oas} />
    )
  }

  renderEndpoint() {
    const {doc, baseUrl} = this.props
    const {isCollapse} = this.state
    return (
        doc.type === 'endpoint' ? (
          <Fragment>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gridTemplateRows: 'repeat(auto-fit, minmax(50px, min-content))',
              gridGap: 8,
              paddingRight: '16px',
              minWidth: 0,
               ...!isCollapse ? {display: 'none'} : {}
              }}
            >
              {this.renderPathUrl()}
              <Description
                doc={doc}
                baseUrl={baseUrl}
              />
              {this.renderLogs()}
              {this.renderParams()}
              {this.renderContentTypeSelect(true)}
              {this.renderSchemaTab()}
            </div>
            <div
              className={'expandable'}
              style={styles.renderCodeAndResponseWrapper}
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
      <Params
        oas={this.oas}
        operation={this.getOperation()}
        formData={this.state.formData}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
        setFormSubmissionListener={this.setFormSubmissionListener}
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
        onVisibleChange={(visibility) => {
          this.setState({showAuthBox: visibility})
        }}
        needsAuth={this.state.needsAuth}
        oauth={this.props.oauth}
        toggleAuth={this.toggleAuth}
        onSubmit={this.onSubmit}
        authInputRef={el => {
          if (el) {
            this.authInput = el
          }
        }}
        auth={this.getCurrentAuth()}
        error={error}
        onReset={this.onAuthReset}
        showReset={this.state.auth !== null}
      />
    );
  }

  render() {
    const {isCollapse} = this.state
    const { doc } = this.props;
    const oas = this.oas;
    const isViewMode = this.context

    return (
      <ErrorBoundary>
        <div id={`page-${doc.slug}`}>
          { !isViewMode &&
            <div style={{
              display: 'grid',
              gridTemplateColumns: isCollapse ? 'minmax(480px, 1fr) minmax(320px, 480px)' : '1fr',
              position: 'relative'
            }}
            >
              {this.renderEndpoint()}
            </div>
          }
          {
            isViewMode && <ViewOnlyMode doc={doc} oas={oas} />
          }
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
  doc: PropTypes.shape(docPropTypes).isRequired,
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
  tryItMetrics: PropTypes.func.isRequired,
  fallbackUrl: PropTypes.string,
  stripSlash: PropTypes.bool,
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
  fallbackUrl: '',
  stripSlash: false,
};

Doc.contextType = ViewMode
