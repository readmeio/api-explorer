const React = require('react');
const PropTypes = require('prop-types');
const showCodeResults = require('./lib/show-code-results');
const classNames = require('classnames');
const IconStatus = require('./IconStatus');

const Oas = require('./lib/Oas');

const { Operation } = Oas;

class ResponseTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'result',
      result: props.result,
    };
    this.setTab = this.setTab.bind(this);
    this.hideResults = this.hideResults;
  }
  setTab(selected) {
    this.setState({ selectedTab: selected });
  }

  hideResults() {
    this.setState({ result: null });
  }

  render() {
    const { result, oas, operation } = this.props;
    return (
      <ul className="code-sample-tabs hub-reference-results-header">
        {
          // eslint-disable-next-line jsx-a11y/href-no-hash
          <a
            href="#" // eslint eslint-disable-line jsx-a11y/href-no-hash
            data-tab="result"
            className={classNames('hub-reference-results-header-item tabber-tab', {
              selected: this.state.selectedTab === 'result',
            })}
            onClick={e => {
              e.preventDefault();
              this.setTab('result');
            }}
          >
            <IconStatus status={result.status} />
          </a>
        }
        {
          // eslint-disable-next-line jsx-a11y/href-no-hash
          <a
            href="#"
            data-tab="metadata"
            className={classNames('hub-reference-results-header-item tabber-tab', {
              selected: this.state.selectedTab === 'metadata',
            })}
            onClick={e => {
              e.preventDefault();
              this.setTab('metadata');
            }}
          >
            Metadata
          </a>
        }
        {showCodeResults(oas, operation).length > 0 && (
          // eslint-disable-next-line jsx-a11y/href-no-hash
          <a
            className="hub-reference-results-back pull-right"
            href="#"
            onClick={e => {
              e.preventDefault();
              this.hideResults();
            }}
          >
            <span className="fa fa-chevron-circle-left"> to examples </span>
          </a>
        )}
      </ul>
    );
  }
}

module.exports = ResponseTabs;

ResponseTabs.propTypes = {
  result: PropTypes.shape({}),
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
};
ResponseTabs.defaultProps = {
  result: {},
};
