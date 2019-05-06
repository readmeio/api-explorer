import colors from './colors'

const React = require('react');
const PropTypes = require('prop-types');

const statusCodes = require('./lib/statuscodes')

const style = {
  circle: {
    height: 10,
    width: 10,
    display: 'inline-block',
    borderRadius: '100%'
  },
  success: {
    background: colors.success
  },
  error: {
    background: colors.error
  }
}

function IconStatus({ status, name }) {
  const statusCode = statusCodes(status);

  if (!statusCode) return <span />;
  return (
    <span style={{color: colors.resultsTab}}>
      <span style={{...style.circle, ...style[statusCode[2]]}} />
      &nbsp;{statusCode[0]}&nbsp;
      <em>{name || statusCode[1]}</em>
    </span>
  );
}

IconStatus.propTypes = {
  status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  name: PropTypes.string,
};

IconStatus.defaultProps = {
  status: 200, // TODO: For some reason this wasn't getting passed sometimes
  name: '',
};

module.exports = IconStatus;
