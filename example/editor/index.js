import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate'

// import SlateMarkdown from '@scottge/slate-markdown-serializer';
import SlateMarkdown from 'slate-mdast-serializer';
import markdownRules from './rules.mdast';
import TablePlugin from 'slate-edit-table';
import renderers from './renderers'

const markdown = new SlateMarkdown({ rules: markdownRules });

const plugins = [
  TablePlugin({
    typeTable: 'table',
    typeRow: 'table-row',
    typeCell: 'table-cell',
  }),
];



class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      // value: Value.fromJSON(props.value),
      value: markdown.deserialize(props.value || '# Write some markdown')
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
    return (
      <Editor
        {...this.props}
        pugins={plugins}
        value={this.state.value}
        renderNode={renderers.renderNode}
        renderMark={renderers.renderMark}
        onContextMenu={this.onContextMenu}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        spellCheck={false}
      />
    )
  }
}

export default App;