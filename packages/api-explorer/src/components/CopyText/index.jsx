import React from 'react'
import PropTypes from 'prop-types'
import { CopyToClipboard } from 'react-copy-to-clipboard'

class CopyText extends React.Component {
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
    const {children, text, className} = this.props
    return (
      <CopyToClipboard className={className} text={text} onCopy={this.onCopy}>
        {children({isCopied: !!this.state.copied})}
      </CopyToClipboard>
    );
  }
}

export default CopyText

CopyText.defaultProps = {
  className: undefined
}

CopyText.propTypes = {
  className: PropTypes.string,
  children: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};
