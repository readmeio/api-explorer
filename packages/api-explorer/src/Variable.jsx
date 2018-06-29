const React = require('react');
const classNames = require('classnames');
const PropTypes = require('prop-types');
const VariablesContext = require('./contexts/variables');

class Variable extends React.Component {
  static renderAuthDropdown() {
    return (
      <div
        className={classNames(
          'ns-popover-dropdown-theme',
          'ns-popover-bottom-placement',
          'ns-popover-right-align',
        )}
        style={{ position: 'absolute' }}
      >
        <div id="loginDropdown" className="ns-popover-tooltip">
          <div className="ns-triangle" />
          <div className="triangle" />
          <div className="pad">
            <div className="text-center">
              Authenticate to personalize this page
              <a className={classNames('btn', 'btn-primary')} href="/oauth" target="_self">
                Authenticate
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  constructor(props) {
    super(props);
    this.state = { showDropdown: false, selected: props.selected };

    this.toggleVarDropdown = this.toggleVarDropdown.bind(this);
    this.toggleAuthDropdown = this.toggleAuthDropdown.bind(this);
    this.selectValue = this.selectValue.bind(this);
    this.renderVarDropdown = this.renderVarDropdown.bind(this);
  }
  getDefault() {
    const def = this.props.defaults.find(d => d.name === this.props.variable) || {};
    if (def.default) return def.default;
    return this.props.variable.toUpperCase();
  }
  // Return value in this order
  // - user value
  // - default value
  // - uppercase key
  getValue() {
    const { variable } = this.props;
    if (this.props.variables[variable]) return this.props.variables[variable];

    return this.getDefault();
  }
  toggleVarDropdown() {
    this.setState({ showDropdown: !this.state.showDropdown });
  }
  toggleAuthDropdown() {
    this.setState({ showAuthDropdown: !this.state.showAuthDropdown });
  }
  selectValue(event) {
    this.setState({ selected: event.target.innerText, showDropdown: false });
  }
  renderVarDropdown() {
    return (
      <div
        className={classNames(
          'ns-popover-dropdown-theme',
          'ns-popover-bottom-placement',
          'ns-popover-right-align',
        )}
        style={{ position: 'absolute' }}
      >
        <div id="variableDropdown" className="ns-popover-tooltip">
          <div className="ns-triangle" />
          <div className="triangle" />
          <ul>
            {this.props.variables.map(key => (
              <li
                className={classNames({ active: this.state.selected === key.name })}
                onClick={this.selectValue}
                key={key.name}
              >
                {key.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  render() {
    const { variable, variables } = this.props;

    const { selected } = this.state;

    if (Array.isArray(variables)) {
      const selectedValue = selected ? variables.find(key => key.name === selected) : variables[0];
      return (
        <span>
          <span className="variable-underline" onClick={this.toggleVarDropdown}>
            {selectedValue[variable]}
          </span>
          {this.state.showDropdown && this.renderVarDropdown()}
        </span>
      );
    }

    // If default is shown and project has oauth, display login dropdown
    if (this.getValue() === this.getDefault() && this.props.oauth) {
      return (
        <span>
          <span className="variable-underline" onClick={this.toggleAuthDropdown}>
            {this.getValue()}
          </span>
          {this.state.showAuthDropdown && Variable.renderAuthDropdown()}
        </span>
      );
    }

    return <span>{this.getValue()}</span>;
  }
}

Variable.propTypes = {
  variable: PropTypes.string.isRequired,
  variables: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  defaults: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, default: PropTypes.string }),
  ).isRequired,
  oauth: PropTypes.bool.isRequired,
};

module.exports = (props) => (
  <VariablesContext.Consumer>
    {variables => {
      return <Variable {...props} variables={variables} />
    } }
  </VariablesContext.Consumer>
);

module.exports.Variable = Variable;
