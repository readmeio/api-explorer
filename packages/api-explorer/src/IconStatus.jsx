const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');

const statusCodes = require('./lib/statuscodes');

function IconStatus({ status, name }) {
  const statusCode = statusCodes(status);

  if (!statusCode) return <span />;

  return (
    <span
      className={classNames({
        httpsuccess: statusCode[2] === 'success',
        httperror: statusCode[2] !== 'success',
      })}
    >
      <i className="fa fa-circle" />
      &nbsp;
      {statusCode[0]}
      &nbsp;
      <em>{name || statusCode[1]}</em>
    </span>
  );
}

IconStatus.propTypes = {
  name: PropTypes.string,
  status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

IconStatus.defaultProps = {
  name: '',
  status: 200, // TODO: For some reason this wasn't getting passed sometimes
};

module.exports = IconStatus;
