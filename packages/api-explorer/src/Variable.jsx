const React = require('react');

class Variable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showDropdown: false, selected: props.selected };

    this.showDropdown = this.showDropdown.bind(this);
    this.selectValue = this.selectValue.bind(this);
  }
  showDropdown() {
    this.setState({ showDropdown: true });
  }
  selectValue(event) {
    this.setState({ selected: event.target.innerText, showDropdown: false });
  }
  render() {
    const { k, value } = this.props;

    const { selected } = this.state;

    if (this.state.showDropdown) {
      return (
        <ul>{value.map(key => <li onClick={this.selectValue} key={key.name}>{key.name}</li>)}</ul>
      );
    }

    if (Array.isArray(value)) {
      const selectedValue = selected ? value.find(key => key.name === selected) : value[0];
      return <span onClick={this.showDropdown}>{selectedValue[k]}</span>;
    }
    return <span>{value}</span>;
  }
}

module.exports = Variable;
