const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');

const statusCodes = require('./lib/statuscodes');

function IconStatus({ status }) {
  const statusCode = statusCodes(status);

  return (
    <span
      className={classNames({
        httpsuccess: statusCode[2] === 'success',
        httperror: statusCode[2] !== 'success',
      })}
    >
      <i className="fa fa-circle" />
      &nbsp;{statusCode[0]}&nbsp;
      <em>{statusCode[1]}</em>
    </span>
  );
}

IconStatus.propTypes = {
  status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

module.exports = IconStatus;
