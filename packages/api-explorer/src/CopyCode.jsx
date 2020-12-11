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

  static getDerivedStateFromProps(props, state) {
    const code = typeof props.code === 'function' ? props.code() : props.code;
    if (!('code' in state) || code !== state.code) {
      return { code };
    }

    return null;
  }

  onCopy(text) {
    this.props.onCopy(text);

    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  }

  render() {
    return (
      <CopyToClipboard onCopy={this.onCopy} text={this.state.code}>
        <button className="copy-code-button" type="button">
          {this.state.copied ? <span className="fa fa-check" /> : <span className="fa fa-clipboard" />}
        </button>
      </CopyToClipboard>
    );
  }
}

CopyCode.propTypes = {
  code: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  onCopy: PropTypes.func,
};

CopyCode.defaultProps = {
  onCopy: () => {},
};

module.exports = CopyCode;
