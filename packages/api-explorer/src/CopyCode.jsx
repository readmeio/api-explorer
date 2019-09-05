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

  componentDidUpdate(prevProps) {
    const code = typeof prevProps.code === 'function' ? prevProps.code() : prevProps.code;

    if (code !== this.state.code) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ code });
    }
  }

  onCopy() {
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  }

  render() {
    return (
      <CopyToClipboard text={this.state.code} onCopy={this.onCopy}>
        <button className="copy-code-button">
          {this.state.copied ? <span className="fa fa-check" /> : <span className="fa fa-clipboard" />}
        </button>
      </CopyToClipboard>
    );
  }
}

module.exports = CopyCode;

CopyCode.propTypes = {
  code: PropTypes.string.isRequired,
};
