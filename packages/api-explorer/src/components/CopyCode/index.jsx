import './style.css'

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
    }, 1000);
  }

  render() {
    // const buttonStyle = {
    //   textTransform: 'uppercase',
    //   background: 'transparent',
    //   color: '#aaaaaa',
    //   cursor: 'pointer',
    //   border: '0px',
    // }

    return (
      <CopyToClipboard class="mia-ctc-button" text={this.state.code} onCopy={this.onCopy}>
        <span>
          {this.state.copied ? <span>Copied</span> : <span>Copy</span>}
        </span>
      </CopyToClipboard>
    );
  }
}

module.exports = CopyCode;

CopyCode.propTypes = {
  code: PropTypes.string.isRequired,
};
