const React = require('react');
const PropTypes = require('prop-types');
const { CopyToClipboard } = require('react-copy-to-clipboard');

class CopyCode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      copied: false,
    };

    this.onCopy = this.onCopy.bind(this);
  }

  onCopy() {
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 1000);
  }

  render() {
    return (
      <CopyToClipboard text={this.props.code} onCopy={this.onCopy}>
        <button className="copy-code-button main_background">
          {this.state.copied ? <span>Copied</span> : <span>Copy</span>}
        </button>
      </CopyToClipboard>
    );
  }
}

module.exports = CopyCode;

CopyCode.propTypes = {
  code: PropTypes.string.isRequired,
};
