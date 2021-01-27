const React = require('react');
const { useEffect, useState } = require('react');
const PropTypes = require('prop-types');

const Doc = require('./Doc');
const ErrorBoundary = require('./ErrorBoundary');

const DocAsync = props => {
  const { maskErrorMessages, oas, onError, ...docProps } = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    (async () => {
      try {
        await oas.dereference();

        setLoading(false);
      } catch (err) {
        setError(err);
      }
    })();
  }, [oas]);

  if (error) {
    // We're passing in `error.message` into the error boundary because it expects a child node to be present. It's fine
    // though as since we're also passing an `error` prop we'll default to our standard error handling instead of
    // rendering out that error message.
    return (
      <ErrorBoundary appContext="explorer" error={error} maskErrorMessages={maskErrorMessages} onError={onError}>
        {error.message}
      </ErrorBoundary>
    );
  }

  if (loading) {
    return (
      <div className="hub-reference">
        <div className="hub-reference-section hub-reference-section-top">
          <div className="hub-reference-left" style={{ visibility: 'hidden' }}></div>
          <div className="hub-reference-right" style={{ borderTopColor: 'transparent' }}>
            &nbsp;
          </div>
        </div>
      </div>
    );
  }

  return <Doc {...docProps} oas={oas} />;
};

DocAsync.propTypes = {
  ...Doc.propTypes,
  maskErrorMessages: PropTypes.bool,
  onError: PropTypes.func,
};

DocAsync.defaultProps = {
  ...Doc.defaultProps,
  maskErrorMessages: true,
  onError: () => {},
};

module.exports = DocAsync;
