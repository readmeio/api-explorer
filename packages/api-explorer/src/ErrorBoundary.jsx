const React = require('react');
const PropTypes = require('prop-types');

// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
function hashErrorMessageToUniqueCode(string) {
  let uniqueCode = 0;
  for (let i = 0; i < string.length; i += 1) {
    uniqueCode = Math.imul(31, uniqueCode) + string.charCodeAt(i) || 0;
  }

  // If for whatever reason we couldn't create an error code for this, create a non-zero random number.
  if (uniqueCode === 0) {
    uniqueCode = Math.random().toString(36).substr(2, 7);
  } else {
    uniqueCode = uniqueCode.toString(36).replace(/-/g, '');
  }

  return uniqueCode.toUpperCase();
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      errorCode: false,
      info: false,
    };

    // For instances where we're running async processes we can't rely on `componentDidCatch` to catch errors because
    // it doesn't catch errors that are thrown from React hooks or inside of `componentDidMount` so we're going to be
    // passing in the `error` prop.
    //
    // @link https://github.com/facebook/react/issues/11334
    if (props.error) {
      this.state.error = props.error;
      this.state.errorCode = this.getSupportCodeAndDispatchError(props.error, false);
    }
  }

  getSupportCodeAndDispatchError(error, info) {
    const supportErrorCode = `ERR-${hashErrorMessageToUniqueCode(error.message)}`;
    const errorData = {
      supportErrorCode,
      componentStack: info,
      ...error,
    };

    this.props.onError(error, errorData);

    return supportErrorCode;
  }

  componentDidCatch(error, info) {
    this.setState({
      error,
      errorCode: this.getSupportCodeAndDispatchError(error, info),
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
  error: PropTypes.any,
  maskErrorMessages: PropTypes.bool.isRequired,
  onError: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  error: false,
  onError: () => {},
};

module.exports = ErrorBoundary;
