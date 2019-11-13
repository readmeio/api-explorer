const React = require('react');
const classNames = require('classnames');
const PropTypes = require('prop-types');
const VariablesContext = require('./contexts/Variables');
const OauthContext = require('./contexts/Oauth');
const SelectedAppContext = require('./contexts/SelectedApp');

class Variable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showDropdown: false };

    this.toggleVarDropdown = this.toggleVarDropdown.bind(this);
    this.toggleAuthDropdown = this.toggleAuthDropdown.bind(this);
    this.renderVarDropdown = this.renderVarDropdown.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.toggleVarDropdown();
    this.props.changeSelected(event.target.value);
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
    if (this.props.user[variable]) return this.props.user[variable];

    return this.getDefault();
  }

  toggleVarDropdown() {
    this.setState(prevState => ({ showDropdown: !prevState.showDropdown }));
  }

  toggleAuthDropdown() {
    this.setState(prevState => ({ showAuthDropdown: !prevState.showAuthDropdown }));
  }

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
        <div className="ns-popover-tooltip" id="loginDropdown">
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

  renderVarDropdown() {
    return (
      <select onChange={this.onChange} value={this.props.selected}>
        {this.props.user.keys.map(key => (
          <option key={key.name} value={key.name}>
            {key.name}
          </option>
        ))}
      </select>
    );
  }

  render() {
    const { variable, user, selected } = this.props;

    if (Array.isArray(user.keys)) {
      const selectedValue = selected ? user.keys.find(key => key.name === selected) : user.keys[0];
      return (
        <span>
          {!this.state.showDropdown && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <span className="variable-underline" onClick={this.toggleVarDropdown}>
              {selectedValue[variable]}
            </span>
          )}
          {this.state.showDropdown && this.renderVarDropdown()}
        </span>
      );
    }

    // If default is shown and project has oauth, display login dropdown
    if (this.getValue() === this.getDefault() && this.props.oauth) {
      return (
        <span>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
  changeSelected: PropTypes.func.isRequired,
  defaults: PropTypes.arrayOf(
    PropTypes.shape({ default: PropTypes.string, name: PropTypes.string }),
  ).isRequired,
  oauth: PropTypes.bool,
  selected: PropTypes.string.isRequired,
  user: PropTypes.shape({
    keys: PropTypes.array,
  }).isRequired,
  variable: PropTypes.string.isRequired,
};

Variable.defaultProps = {
  oauth: false,
};

/* istanbul ignore next */
// eslint-disable-next-line react/display-name
module.exports = props => (
  <VariablesContext.Consumer>
    {({ user, defaults }) => (
      <OauthContext.Consumer>
        {oauth => (
          <SelectedAppContext.Consumer>
            {({ selected, changeSelected }) => (
              <Variable
                {...props}
                changeSelected={changeSelected}
                defaults={defaults}
                oauth={oauth}
                selected={selected}
                user={user}
              />
            )}
          </SelectedAppContext.Consumer>
        )}
      </OauthContext.Consumer>
    )}
  </VariablesContext.Consumer>
);

module.exports.Variable = Variable;

// Regex to match the following:
// - \<<apiKey\>> - escaped variables
// - <<apiKey>> - regular variables
// - <<glossary:glossary items>> - glossary
module.exports.VARIABLE_REGEXP = /(?:\\)?<<([-\w:\s]+)(?:\\)?>>/.source;
module.exportsVariablesContext = VariablesContext