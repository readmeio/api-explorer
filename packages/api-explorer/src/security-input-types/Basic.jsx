const React = require('react');
const PropTypes = require('prop-types');

function Basic({ user, pass, change, authInputRef }) {
  function inputChange(name, value) {
    change(Object.assign({ user, pass }, { [name]: value }))
  }

  return (
    <div className="row">
      <div className="col-xs-6">
        <label htmlFor="user">username</label>
        <input
          ref={authInputRef}
          type="text"
          onChange={e => inputChange(e.currentTarget.name, e.currentTarget.value)}
          name="user"
          value={user}
        />
      </div>
      <div className="col-xs-6">
        <label htmlFor="password">password</label>
        <input
          type="text"
          onChange={e => inputChange(e.currentTarget.name, e.currentTarget.value)}
          name="pass"
          value={pass}
        />
      </div>
    </div>
  );
}

Basic.propTypes = {
  change: PropTypes.func.isRequired,
  authInputRef: PropTypes.func,
  user: PropTypes.string,
  pass: PropTypes.string,
};

Basic.defaultProps = {
  user: '',
  pass: '',
  authInputRef: () => {},
}

module.exports = Basic;
