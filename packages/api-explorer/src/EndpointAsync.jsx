const React = require('react');
const { useEffect, useState } = require('react');
const PropTypes = require('prop-types');

const Endpoint = require('./Endpoint');
const ErrorBoundary = require('./ErrorBoundary');

const EndpointAsync = props => {
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
    return null;
  }

  return <Endpoint {...docProps} oas={oas} />;
};

EndpointAsync.propTypes = {
  ...Endpoint.propTypes,
  maskErrorMessages: PropTypes.bool,
  onError: PropTypes.func,
};

EndpointAsync.defaultProps = {
  ...Endpoint.defaultProps,
  maskErrorMessages: true,
  onError: () => {},
};

module.exports = EndpointAsync;
