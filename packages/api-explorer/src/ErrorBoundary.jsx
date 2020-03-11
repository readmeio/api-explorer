const React = require('react');
const PropTypes = require('prop-types');
const shortid = require('shortid');

class ErrorBoundary extends React.Component {
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
    const { appContext, children, maskErrorMessages } = this.props;

    if (!error) {
      return children;
    }

    function getErrorMessage() {
      let msg;
      if (appContext === 'endpoint') {
        msg = "This endpoint's documentation is currently experiencing difficulties and will be back online shortly.";
      } else {
        msg = 'The API Explorer is currently experiencing difficulties and will be back online shortly.';
      }

      if (maskErrorMessages) {
        return msg;
      }

      return (
        <span>
          {msg} Please contact{' '}
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

ErrorBoundary.propTypes = {
  appContext: PropTypes.oneOf(['endpoint', 'explorer']).isRequired,
  children: PropTypes.node.isRequired,
  maskErrorMessages: PropTypes.bool.isRequired,
  onError: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  onError: () => {},
};

module.exports = ErrorBoundary;
