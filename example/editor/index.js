import React from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate'

import Markdown from 'slate-mdast-serializer';
import markdownRules from './rules.mdast';
import {renderNode, renderMark} from './renderers'
const markdown = new Markdown({ rules: markdownRules });

const plugins = [];

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: markdown.deserialize(props.value || 'Write some markdown to start documenting your API!')
    }
    this.editor = React.createRef();
  }
  onChange = ({ value }) => {
    this.setState({ value })
  }
  onKeyDown(event, editor, next) {
    if (!event.ctrlKey) return next()
    switch (event.key) {
      case 'b': {
        event.preventDefault()
        editor.toggleMark('bold')
        break
      }
      case 'i': {
        event.preventDefault()
        editor.toggleMark('italic')
        break
      }
      case '`': {
        event.preventDefault()
        editor.toggleMark('code')
        break
      }
      case ']': {
        event.preventDefault()
        editor.setBlocks('code')
        break
      }
      case '.': {
        event.preventDefault()
        editor.setBlocks('block-quote')
        break
      }
      case 'S':
        console.log({value: editor.value, serialized: markdown.serialize(editor.value)});
        break;
      default:
        return next();
    }
  }
  render() {
    return (<div id="ReadMeEditor">
      <Editor
        {...this.props}
        plugins={plugins}
        value={this.state.value}
        renderNode={renderNode}
        renderMark={renderMark}
        onContextMenu={this.onContextMenu}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        spellCheck={false}
      />
    </div>)
  }
}

export default App;