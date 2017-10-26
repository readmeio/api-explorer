const React = require('react');
const PropTypes = require('prop-types');

class Basic extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: '', password: '' };
    this.inputChange = this.inputChange.bind(this);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.user !== this.state.user || prevState.password !== this.state.password)
      this.props.change(this.state);
  }
  inputChange(name, value) {
    this.setState(previousState => {
      return Object.assign({}, previousState, { [name]: value });
    });
  }
  render() {
    return (
      <div className="row">
        <div className="col-xs-6">
          <label htmlFor="user">username</label>
          <input
            ref={this.props.authInputRef}
            type="text"
            onChange={e => this.inputChange(e.currentTarget.name, e.currentTarget.value)}
            name="user"
          />
        </div>
        <div className="col-xs-6">
          <label htmlFor="password">password</label>
          <input
            type="text"
            onChange={e => this.inputChange(e.currentTarget.name, e.currentTarget.value)}
            name="password"
          />
        </div>
      </div>
    );
  }
}

Basic.propTypes = {
  change: PropTypes.func.isRequired,
  authInputRef: PropTypes.func,
};

Basic.defaultProps = {
  authInputRef: () => {},
};

module.exports = Basic;
