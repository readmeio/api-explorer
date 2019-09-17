import React from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate'

import {renderNode, renderMark} from './renderers'
import BlockCommands from './commands/convert-blocks'

import Block, {createBlocks} from './blocks';

import Serial from 'slate-mdast-serializer';
import markdownRules from './rules.mdast';

const schema = {
  blocks: {
    image: {
      isVoid: true,
    },
  },
};

for (const key in Block.types) {
  const block = Block.types[key];
  if (block.schema) schema.blocks[block.type] = block.schema
};
console.log(schema)

const plugins = [
  ...createBlocks(Object.values(Block.types)),
  ...BlockCommands(
    ['>', 'space', 'blockquote'],
    ['#', 'space', 'h1'],
    ['##', 'space', 'h2'],
    ['###', 'space', 'h3'],
    ['####', 'space', 'h4'],
    ['#####', 'space', 'h5'],
    ['######', 'space', 'h6'],
    ['#1', 'space', 'h1'],
    ['#2', 'space', 'h2'],
    ['#3', 'space', 'h3'],
    ['#4', 'space', 'h4'],
    ['#5', 'space', 'h5'],
    ['#6', 'space', 'h6'],
    [/^(-|\+|\*)$/, 'space', 'list-item'],
    [/^(\d\.)$/, 'space', 'list'],
    [/^(```([\w-\.]+)?(\s[\w-\.]+)?)$/, 'enter', 'code'],
  ),
];
const markdown = new Serial({ rules: markdownRules });

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: markdown.deserialize(props.value || 'Write some markdown to start documenting your API!')
    }
    this.editor = React.createRef();
  }
  componentDidMount(){
    console.log('mounted')
  }
  editorHasSelection() {
    const {editor} = this;
    const anchor = editor.value.selection.get('anchor');
    const focus = editor.value.selection.get('focus');
    // console.log({anchor, focus})
    if (anchor.get('offset') === focus.get('offset')) return false;
    return true
  }
  onChange = ({ value }) => {
    this.setState({ value })
  }
  onContextMenu(event, editor, next) {
    event.preventDefault()
    const blocks = editor.value.blocks;
    const isCode = blocks.some(block => block.type=='code');
    console.log({blocks, isCode})
    // editor.setBlocks(isCode ? 'paragraph' : 'code');
    return false
  }
  onKeyDown = (event, editor, next) => {
    const {key, shiftKey, ctrlKey, metaKey} = event
    const {blocks} = this.editor.value
    const hasSelection = this.editorHasSelection();
    switch (key) {
      case 'Backspace':
        if (blocks.size === 1 && blocks.some(b => b.get('type')==='image')) {
          event.preventDefault();
          this.editor.delete()
          return;
        }
      case 'Enter':
        if(shiftKey){
          event.preventDefault();
          editor.command('insertText', '\n');
          return;
        }
      case '>': {
        if (hasSelection) {
          event.preventDefault();
          editor.wrapBlock('blockquote');
        }
        break;
      }
      case '<': {
        // const match = blocks.some(block => block.get('type')=='paragraph' || block.get('type')=='blockquote');
        if (hasSelection /* && match */) {
          event.preventDefault();
          this.editor.unwrapBlock('blockquote')//.setBlocks('paragraph');
        }
        break;
      }
      case '`':
      case "*":
      case "+":
      case "_":
      case "~": {
        if (hasSelection) {
          event.preventDefault()
          const {key} = event;
          const methods = {
            '`': 'code',
            '~': 'deleted',
            '*': 'bold',
            '_': 'italic',
            '+': 'added',
          };
          key in methods && editor.toggleMark(methods[key]);
        }
        break;
      };
      case "(":
      case "{":
      case "[":
      case "'":
      case "‘":
      case "“":
      case '"': {
        if (hasSelection) {
          event.preventDefault()
          const {key} = event;
          const map = {
            '(': ')',
            '[': ']',
            '{': '}',
            '“': '”',
            '‘': '’',
          };
          editor.wrapText(key, key in map ? map[key] : key).moveStartBackward().moveEndForward();
        }
        break;
      };
    };
    if (!(event.ctrlKey || event.metaKey)) return next()
    switch (event.key) {
      case 'Enter':
        event.preventDefault() | editor.insertBlock('paragraph').unwrapBlock();
        break;
      case 'a':
        if (!hasSelection) {
          event.preventDefault()
          editor.moveStartToStartOfBlock().moveEndToEndOfBlock();
        }
        break;
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
      case '\\': {
        event.preventDefault();
        editor.unwrapBlock().setBlocks('paragraph');
        break
      }
      case 'S': {
        const ast = markdown.serialize(editor.value);
        /*now we have an ^AST object and can
          stringify the tree to Markdown via
          the render.md() method:
         */ 
        const mdx = require("../../packages/markdown").render.md(ast, {
          correctnewlines: true,
          markdownOptions: {
            fences: true,
            commonmark: true,
            gfm: true,
            ruleSpaces: false,
            listItemIndent: '1',
            spacedTable: false
          }
        });
        console.warn('SEE example/editor/index.js:53-70 IN THE api-explorer REPO', {ast, mdx});
        // console.log({ast, mdx: 'SEE example/editor/index.js:53-70 IN THE api-explorer REPO'});
        break;
      }
      default:
        return next();
    }
  }
  render() {
    return (<div id="ReadMeEditor">
      <Editor
        {...this.props}
        schema={schema}
        plugins={plugins}
        value={this.state.value}
        renderNode={renderNode}
        renderMark={renderMark}
        onContextMenu={this.onContextMenu}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        spellCheck={false}
        ref={editor => this.editor = editor}
      />
    </div>)
  }
}

export default App;