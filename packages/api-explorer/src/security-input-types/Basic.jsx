const React = require('react');
const PropTypes = require('prop-types');

function Basic({ user, pass, change, authInputRef, Input }) {
  function inputChange(name, value) {
    change({ user, pass, [name]: value });
  }

  return (
    <div className="row">
      <div className="col-xs-6">
        <label htmlFor="user">username</label>
        <Input
          inputRef={authInputRef}
          type="text"
          onChange={e => inputChange(e.target.name, e.target.value)}
          name="user"
          value={user}
        />
      </div>
      <div className="col-xs-6">
        <label htmlFor="password">password</label>
        <Input
          type="text"
          onChange={e => inputChange(e.target.name, e.target.value)}
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
  Input: PropTypes.func.isRequired,
};

Basic.defaultProps = {
  user: '',
  pass: '',
  authInputRef: () => {},
};

module.exports = Basic;
