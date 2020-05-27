import React from 'react'
import PropTypes from 'prop-types'
import syntaxHighlighter from '@mia-platform/syntax-highlighter'

import CopyCode from '../components/CopyCode'

/*
 * This component is used internally by Code
 * The reason why it has to be a separate component
 * is because of the copying code functionality.
 *
 * The stuff that we're syntax highlighting may have
 * JWT variables embedded inside of it, but we don't
 * know that until it's been rendered by the syntax
 * highlighter.
 *
 * Because we want the rendered value and not the template
 * <<apiKey>>, we have to render it first, then fetch
 * the `textContent` out of the ref.
 *
 * We have to call setState with the value of the ref
 * because CopyCode is rendered before the <code> element
 * and setting a ref on it's own does not cause a rerender.
 */
class CodeElement extends React.PureComponent {
  constructor(props) {
    super(props);
    this.el = React.createRef();
    this.state = { el: null };
  }
  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ el: this.el.current });
  }
  render() {
    const { activeTab, code, dark } = this.props;

    return (
      <div style={{ display: activeTab ? 'block' : 'none' }}>
        <CopyCode code={() => (this.state.el ? this.state.el.textContent : '')} />
        {
          // eslint-disable-next-line react/no-array-index-key
          <pre style={{ display: activeTab ? 'block' : 'none' }}>
            <code ref={this.el}>
              {syntaxHighlighter(code.code, code.language, {
                dark,
                tokenizeVariables: true,
              })}
            </code>
          </pre>
        }
      </div>
    );
  }
}

CodeElement.propTypes = {
  activeTab: PropTypes.bool.isRequired,
  code: PropTypes.shape({
    code: PropTypes.string,
    language: PropTypes.string,
  }).isRequired,
  dark: PropTypes.bool.isRequired,
};

module.exports = CodeElement;
