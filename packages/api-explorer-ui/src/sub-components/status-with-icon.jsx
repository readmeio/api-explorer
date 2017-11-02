const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');

function IconStatus({ result }) {
  return (
    <span
      className={classNames({
        httpsuccess: result.statusCode[2] === 'success',
        httperror: result.statusCode[2] !== 'success',
      })}
    >
      <i className="fa fa-circle" />
      <em>
        &nbsp;{result.statusCode[0]}&nbsp;
        {result.statusCode[1]}
      </em>
    </span>
  );
}

IconStatus.propTypes = {
  result: PropTypes.shape({}).isRequired,
};

module.exports = IconStatus;
