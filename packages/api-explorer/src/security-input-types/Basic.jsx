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
          name="user"
          onChange={e => inputChange(e.target.name, e.target.value)}
          type="text"
          value={user}
        />
      </div>
      <div className="col-xs-6">
        <label htmlFor="password">password</label>
        <Input
          name="pass"
          onChange={e => inputChange(e.target.name, e.target.value)}
          type="text"
          value={pass}
        />
      </div>
    </div>
  );
}

Basic.propTypes = {
  authInputRef: PropTypes.func,
  change: PropTypes.func.isRequired,
  Input: PropTypes.func.isRequired,
  pass: PropTypes.string,
  user: PropTypes.string,
};

Basic.defaultProps = {
  authInputRef: () => {},
  pass: '',
  user: '',
};

module.exports = Basic;
