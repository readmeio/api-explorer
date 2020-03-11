const React = require('react');
const PropTypes = require('prop-types');
const shortid = require('shortid');

// const BoundaryStackTrace = require('./BoundaryStackTrace');

class EndpointErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
      errorCode: false,
      info: false,
    };
  }

  componentDidCatch(error, info) {
    const errorEventId = `ERR-${shortid.generate()}`;
    const errorCode = this.props.onError(error, { errorEventId, componentStack: info });

    this.setState({
      error,
      errorCode: typeof errorCode !== 'undefined' ? errorCode : errorEventId,
      info,
    });
  }

  render() {
    const { error, errorCode } = this.state;
    const { children, maskErrorMessages } = this.props;

    if (!error) {
      return children;
    }

    function getErrorMessage() {
      if (maskErrorMessages) {
        return "This endpoint's documentation is currently experiencing difficulties and will be back online shortly.";
      }

      return (
        <span>
          This endpoint&apos;s documentation is currently experiencing difficulties and will be back online shortly.
          Please contact{' '}
          <a href={`mailto:support@readme.io?subject=API Explorer Error [${errorCode}]`}>support@readme.io</a> with your
          error code.
        </span>
      );
    }

    return (
      <div className="hub-reference-section">
        <div className="hub-reference-left" style={{ paddingLeft: '2%' }}>
          <div className="hub-reference-error">
            <span aria-label="Experiencing difficulties" className="hub-reference-error-icon" role="img">
              🚧
            </span>
            <p className="hub-reference-error-text">{getErrorMessage()}</p>
            {!maskErrorMessages && errorCode && <code className="hub-reference-error-code">{errorCode}</code>}
          </div>
        </div>
        <div className="hub-reference-right" />
      </div>
    );
  }
}

EndpointErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  maskErrorMessages: PropTypes.bool.isRequired,
  onError: PropTypes.func,
};

EndpointErrorBoundary.defaultProps = {
  onError: () => {},
};

module.exports = EndpointErrorBoundary;
