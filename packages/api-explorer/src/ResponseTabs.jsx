const React = require('react');
const PropTypes = require('prop-types');
const { Operation } = require('oas/tooling');

const IconStatus = require('./IconStatus');
const Tab = require('./Tab');

class ResponseTabs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      responseExamples: null,
    };
  }

  componentDidMount() {
    const { operation } = this.props;

    operation
      .getResponseExamples()
      .then(examples => {
        this.setState({
          responseExamples: examples,
        });
      })
      .catch(() => {
        // If we fail to generate examples for whatever reason fail silently.
      });
  }

  render() {
    const { responseExamples } = this.state;
    const { result, responseTab, setTab, hideResults } = this.props;

    return (
      <ul className="code-sample-tabs hub-reference-results-header">
        <Tab
          onClick={e => {
            e.preventDefault();
            setTab('result');
          }}
          selected={responseTab === 'result'}
        >
          <IconStatus status={result.status} />
        </Tab>

        <Tab
          onClick={e => {
            e.preventDefault();
            setTab('metadata');
          }}
          selected={responseTab === 'metadata'}
        >
          Metadata
        </Tab>

        {responseExamples && (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a
            className="hub-reference-results-back pull-right"
            href="#"
            onClick={e => {
              e.preventDefault();
              hideResults();
            }}
          >
            <i className="fa fa-chevron-circle-left" />
            Examples
          </a>
        )}
      </ul>
    );
  }
}

ResponseTabs.propTypes = {
  hideResults: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  responseTab: PropTypes.string.isRequired,
  result: PropTypes.shape({
    status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  setTab: PropTypes.func.isRequired,
};

ResponseTabs.defaultProps = {
  result: {},
};

module.exports = ResponseTabs;
