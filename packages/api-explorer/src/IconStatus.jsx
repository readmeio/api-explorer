const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const { getStatusCode } = require('@readme/http-status-codes');

function IconStatus({ status }) {
  let statusCode;
  try {
    statusCode = getStatusCode(status);
  } catch (e) {
    return <span />;
  }

  let visibleStatusCode = '';
  if (statusCode.code) {
    visibleStatusCode = `${statusCode.code} `;
  }

  return (
    <span
      className={classNames({
        httpsuccess: statusCode.success,
        httperror: !statusCode.success,
      })}
    >
      <i className="fa fa-circle" /> {visibleStatusCode}
      <em>{statusCode.message}</em>
    </span>
  );
}

IconStatus.propTypes = {
  status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

IconStatus.defaultProps = {
  status: 200, // TODO: For some reason this wasn't getting passed sometimes
};

module.exports = IconStatus;
