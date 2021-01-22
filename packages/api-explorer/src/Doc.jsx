const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('@readme/oas-extensions');
const markdown = require('@readme/markdown').default;
const markdownMagic = require('@readme/markdown-magic');
const { Waypoint } = require('react-waypoint');
const Oas = require('oas/tooling');

const { TutorialTile } = require('@readme/ui/.bundles/es/ui/compositions');
require('@readme/ui/.bundles/umd/main.css');

const Endpoint = require('./Endpoint');
const EndpointAsync = require('./EndpointAsync');

class Doc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEndpoint: false,
    };

    this.waypointEntered = this.waypointEntered.bind(this);
  }

  waypointEntered() {
    this.setState({ showEndpoint: true });
  }

  renderEndpoint() {
    const { shouldDereferenceOas } = this.props;

    // Creating a stable test environment to be able to test the EndpointAsync component on this root Explorer component
    // is extremely challenging with our current adhoc setup of `enzyme` and `@testing-library/react` so instead of
    // futzing with it, we have a `shouldDereferenceOas` prop on this component that dictates if we should wrap
    // `Endpoint` with `EndpointAsync`.
    //
    // It's messy, but it at least lets us code tests for this component to be supplied dereferenced OAS definitions
    // while also having a functional server environment where async dereferencing is always enabled.
    if (shouldDereferenceOas) {
      return <EndpointAsync {...this.props} />;
    }

    return <Endpoint {...this.props} />;
  }

  render() {
    const { doc, lazy, oas, useNewMarkdownEngine } = this.props;

    const renderEndpoint = () => {
      if (this.props.appearance.splitReferenceDocs) return this.renderEndpoint();
      if (lazy) {
        return (
          <Waypoint bottomOffset="-1%" fireOnRapidScroll={false} onEnter={this.waypointEntered}>
            {this.state.showEndpoint ? this.renderEndpoint() : <div />}
          </Waypoint>
        );
      }

      return this.renderEndpoint();
    };

    return (
      <div className="hub-reference" id={`page-${doc.slug}`}>
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid */}
        <a className="anchor-page-title" id={doc.slug} />

        <div className="hub-reference-section hub-reference-section-top">
          {/* todo: replace this.state.showEndpoint */}
          <div className="hub-reference-left" style={{ visibility: this.state.showEndpoint ? '' : 'hidden' }}>
            <header>
              {this.props.suggestedEdits && (
                <a className="hub-reference-edit pull-right" href={`${this.props.baseUrl}/reference-edit/${doc.slug}`}>
                  <i className="icon icon-register" />
                  Suggest Edits
                </a>
              )}

              <h2>{doc.title}</h2>
              {doc.excerpt && (
                <div className="markdown-body excerpt">
                  {useNewMarkdownEngine ? markdown(doc.excerpt, { copyButtons: false }) : markdownMagic(doc.excerpt)}
                </div>
              )}
            </header>
            {doc.tutorials && !!doc.tutorials.length && (
              <div className="TutorialTile-Container">
                {doc.tutorials.map((t, idx) => (
                  <TutorialTile key={`tutorial-${idx}`} openTutorial={this.props.openTutorialModal} tutorial={t} />
                ))}
              </div>
            )}
          </div>
          {/* todo: replace this.state.showEndpoint */}
          <div className="hub-reference-right" style={{ borderTopColor: this.state.showEndpoint ? '' : 'transparent' }}>
            &nbsp;
          </div>
        </div>

        {renderEndpoint()}
        {
          // TODO maybe we dont need to do this with a hidden input now
          // cos we can just pass it around?
        }
        <input id={`swagger-${extensions.SEND_DEFAULTS}`} type="hidden" value={oas[extensions.SEND_DEFAULTS]} />
      </div>
    );
  }
}

Doc.propTypes = {
  appearance: PropTypes.shape({
    referenceLayout: PropTypes.string,
    splitReferenceDocs: PropTypes.bool,
  }),
  auth: PropTypes.shape({}).isRequired,
  baseUrl: PropTypes.string,
  doc: PropTypes.shape({
    api: PropTypes.shape({
      examples: PropTypes.shape({
        codes: PropTypes.arrayOf(
          PropTypes.shape({
            code: PropTypes.string.isRequired,
            language: PropTypes.string.isRequired,
          })
        ),
      }),
      method: PropTypes.string.isRequired,
      params: PropTypes.arrayOf(PropTypes.object),
      results: PropTypes.shape({
        codes: PropTypes.arrayOf(PropTypes.shape({})),
      }),
    }),
    body: PropTypes.string,
    excerpt: PropTypes.string,
    slug: PropTypes.string.isRequired,
    swagger: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }),
    title: PropTypes.string.isRequired,
    tutorials: PropTypes.arrayOf(PropTypes.shape({})),
    type: PropTypes.string.isRequired,
  }).isRequired,
  enableRequestBodyJsonEditor: PropTypes.bool,
  flags: PropTypes.shape({
    correctnewlines: PropTypes.bool,
  }),
  group: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  language: PropTypes.string.isRequired,
  lazy: PropTypes.bool,
  loginUrl: PropTypes.string,
  Logs: PropTypes.func,
  maskErrorMessages: PropTypes.bool,
  oas: PropTypes.instanceOf(Oas).isRequired,
  oasUrl: PropTypes.string,
  oauth: PropTypes.bool.isRequired,
  onAuthChange: PropTypes.func.isRequired,
  onAuthGroupChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
  openTutorialModal: PropTypes.func,
  setLanguage: PropTypes.func.isRequired,
  shouldDereferenceOas: PropTypes.bool,
  suggestedEdits: PropTypes.bool.isRequired,
  tryItMetrics: PropTypes.func.isRequired,
  useNewMarkdownEngine: PropTypes.bool,
  user: PropTypes.shape({}),
};

Doc.defaultProps = {
  appearance: {
    referenceLayout: 'row',
    splitReferenceDocs: false,
  },
  baseUrl: '/',
  enableRequestBodyJsonEditor: false,
  flags: {
    correctnewlines: false,
  },
  group: '',
  groups: [],
  lazy: true,
  Logs: undefined,
  maskErrorMessages: true,
  oasUrl: '',
  onError: () => {},
  openTutorialModal: () => {},
  shouldDereferenceOas: true,
  useNewMarkdownEngine: false,
  user: {},
};

module.exports = Doc;
