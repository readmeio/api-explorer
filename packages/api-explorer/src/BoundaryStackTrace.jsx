const React = require('react');
const PropTypes = require('prop-types');

function BoundaryStackTrace({ error, info }) {
  return (
    <pre style={{ whiteSpace: 'pre-wrap' }}>
      {error.toString()}
      {info.componentStack}
    </pre>
  );
}

BoundaryStackTrace.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired,
  info: PropTypes.shape({
    componentStack: PropTypes.string.isRequired,
  }).isRequired,
};

module.exports = BoundaryStackTrace;
