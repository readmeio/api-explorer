const React = require('react');
const PropTypes = require('prop-types');
const extensions = require('../../../packages/oas-extensions/');

const Sidebar = require('./Sidebar');
const Version = require('./Version');
const ApiExplorer = require('../../../packages/api-explorer/src');
const withSpecFetching = require('../../src/SpecFetcher');

class Preview extends React.Component {
  componentDidMount() {
    const searchParams = new URLSearchParams(window.location.search);
    this.props.fetchSwagger(searchParams.get('url') || '../swagger-files/petstore.json');
  }

  componentDidUpdate() {
    if (!this.props.isLoading) {
      // Introduce some artifical loading so if we have a bad spec cached, we don't flash a loading
      // screen upon the user for a split second.
      setTimeout(() => {
        document.getElementById('main').classList.add('is-loaded');
        document.getElementById('loading-screen').classList.add('is-loaded');
        document.getElementById('hub-sidebar-parent').display = 'none';

        if (this.props.status.length) {
          document.getElementById('hub-content').classList.add('with-errors');
        }
      }, 250);
    }
  }

  render() {
    const { status, docs, invalidSpec, invalidSpecPath, oas, oauth } = this.props;

    return (
      <div>
        <div id="hub-reference">
          <div className="hub-reference">
            {!status.length ? (
              <div className="hub-reference-section">
                <div className="hub-reference-left">
                  <div className="hub-preview">
                    <div className="hub-preview-owlbert" />
                    <i className="icon icon-readme" />
                    <p>
                      <strong>Like what you see?</strong> ReadMe makes it easy to create beautiful documentation for
                      your API! You can import a Swagger/OAS file&hellip; but that&apos;s not all! ReadMe also helps you
                      build a community, document non-API references and much more! Sign up now to get awesome docs for
                      your Swagger/OAS file!
                    </p>
                    <a className="btn btn-primary btn-lg" href="https://dash.readme.io/signup">
                      Sign Up for ReadMe
                    </a>
                  </div>
                </div>
                <div className="hub-reference-right">&nbsp;</div>
              </div>
            ) : (
              <div className="hub-reference-section">
                <div id="hub-reference-loading-error">
                  <div className="hub-reference-loading-error-box">
                    {invalidSpec ? (
                      <div>
                        <h3 className="hub-reference-loading-error-header">Invalid API Specification</h3>
                        <p>{invalidSpec}</p>
                        <p>
                          <a
                            className="btn btn-primary btn-lg"
                            href={`http://openap.is/validate?url=${invalidSpecPath}`}
                          >
                            View Validation Report
                          </a>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="hub-reference-loading-error-header">Couldn&apos;t be loaded</h3>
                        <p>There was an error fetching your API Specification.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {status.length === 0 && oas.info && <Sidebar docs={docs} title={oas.info.title} />}
        {status.length === 0 && oas.info && <Version docs={docs} version={oas.info.version} />}
        {status.length === 0 && (
          <ApiExplorer
            appearance={{ referenceLayout: 'row' }}
            docs={docs}
            glossaryTerms={[]}
            oasFiles={{
              'api-setting': Object.assign(extensions.defaults, oas),
            }}
            oauth={oauth}
            suggestedEdits={false}
            variables={{
              user: {},
              defaults: [],
            }}
          />
        )}
      </div>
    );
  }
}

Preview.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.shape).isRequired,
  fetchSwagger: PropTypes.func.isRequired,
  invalidSpec: PropTypes.string,
  invalidSpecPath: PropTypes.string,
  isLoading: PropTypes.bool,
  oas: PropTypes.shape({
    info: PropTypes.shape({
      title: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
    }),
  }).isRequired,
  oauth: PropTypes.bool,
  status: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Preview.defaultProps = {
  invalidSpec: null,
  invalidSpecPath: null,
  isLoading: true,
  oauth: false,
};

module.exports = withSpecFetching(Preview);
