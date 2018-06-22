/* eslint-disable react/prop-types */
const React = require('react');
const classNames = require('classnames');

class Variable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showDropdown: false, selected: props.selected };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.selectValue = this.selectValue.bind(this);
    this.renderDropdown = this.renderDropdown.bind(this);
  }
  toggleDropdown() {
    this.setState({ showDropdown: !this.state.showDropdown });
  }
  selectValue(event) {
    this.setState({ selected: event.target.innerText, showDropdown: false });
  }
  renderDropdown() {
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
            {this.props.value.map(key => (
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
    const { k, value } = this.props;

    const { selected } = this.state;

    if (Array.isArray(value)) {
      const selectedValue = selected ? value.find(key => key.name === selected) : value[0];
      return (
        <span>
          <span className="variable-underline" onClick={this.toggleDropdown}>
            {selectedValue[k]}
          </span>
          {this.state.showDropdown && this.renderDropdown()}
        </span>
      );
    }
    return <span>{value}</span>;
  }
}

module.exports = Variable;
