import React from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate'

import {renderNode, renderMark} from './renderers'
import BlockCommands from './commands/convert-blocks'

import Serial from 'slate-mdast-serializer';
import markdownRules from './rules.mdast';

const markdown = new Serial({ rules: markdownRules });
const plugins = [
  ...BlockCommands(
    ['>', 'space', 'blockquote'],
    ['#', 'space', 'heading1'],
    ['##', 'space', 'heading2'],
    ['###', 'space', 'heading3'],
    ['####', 'space', 'heading4'],
    ['#####', 'space', 'heading5'],
    ['######', 'space', 'heading6'],
    [/^(```([\w-\.]+)?(\s[\w-\.]+)?)$/, 'enter', 'code'],
  ),
];

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
        const ast = markdown.serialize(editor.value);
        /*now we have an ^AST object and can
          stringify the tree to Markdown via
          the render.md() method:
         */ 
        const mdx = require('../../packages/markdown').render.md(ast, {
          correctnewlines: true,
          markdownOptions: {
            fences: true,
            commonmark: false,
            gfm: true
          },
          settings: {
            position: false
          }
        })
        console.warn('SEE example/editor/index.js:53-70 IN THE api-explorer REPO', {ast, mdx});
        // console.log({ast, mdx: 'SEE example/editor/index.js:53-70 IN THE api-explorer REPO'});
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