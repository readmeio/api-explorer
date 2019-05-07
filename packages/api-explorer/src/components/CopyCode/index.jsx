import {FormattedMessage} from 'react-intl';

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

  onCopy() {
    if (!this.state.copied) {
      this.setState({ copied: true }, () => {
        setTimeout(() => {
          this.setState({ copied: false })
        }, 1000)
      });
    }
  }

  render() {
    return (
      <CopyToClipboard className="mia-ctc-button" text={this.props.code} onCopy={this.onCopy}>
        <span>
          {
            this.state.copied ?
              <span><FormattedMessage id="code.copied" defaultMessage="Copied" /></span>
              :
              <span><FormattedMessage id="code.copy" defaultMessage="Copy" /></span>
          }
        </span>
      </CopyToClipboard>
    );
  }
}

module.exports = CopyCode;

CopyCode.propTypes = {
  code: PropTypes.string.isRequired,
};
