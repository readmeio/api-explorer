const React = require('react');
const PropTypes = require('prop-types');

class Basic extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: props.user || '', password: props.pass || '' };
    this.inputChange = this.inputChange.bind(this);
  }
  // TODO refactor this
  // This is not ideal... we're having to update the state
  // here so that the code sample updates with the base64
  // encoded user/pass on first render. This is a sign of
  // bad prop passing somewhere and is quite un-reacty.
  // Maybe we should be calling getAuth from the top level
  // so the value is correct on the first pass through to
  // the CodeSample component. Let me mull this over a little more.
  //
  // This also has the unfortunate side-effect of making the "Try It"
  // button in the explorer turn active by default, as though an edit
  // has been made
  componentDidMount() {
    this.props.change({ user: this.state.user, password: this.state.password });
  }
  componentDidUpdate(prevProps, prevState) {
    // Without this if block the code spirals into an infinite loop
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
            value={this.state.user}
          />
        </div>
        <div className="col-xs-6">
          <label htmlFor="password">password</label>
          <input
            type="text"
            onChange={e => this.inputChange(e.currentTarget.name, e.currentTarget.value)}
            name="password"
            value={this.state.password}
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
