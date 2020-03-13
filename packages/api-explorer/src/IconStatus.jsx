const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const { isValidStatusCode, getStatusCode } = require('@readme/http-status-codes');

function IconStatus({ status, name }) {
  if (!isValidStatusCode(status)) {
    return <span />;
  }

  const statusCode = getStatusCode(status);

  return (
    <span
      className={classNames({
        httpsuccess: statusCode.success,
        httperror: !statusCode.success,
      })}
    >
      <i className="fa fa-circle" /> {statusCode.code} <em>{name || statusCode.message}</em>
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
