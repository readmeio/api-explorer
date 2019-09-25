import React from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate'

import renderMark from './marks' /** @todo: convert mark renderers to use the Slate plugin base */
import BlockCommands from './commands/convert-blocks'

import Block, {createBlocks, types} from './blocks'; /** @todo: simplify createBlocks method implementation */

import Serial from 'slate-mdast-serializer';
import markdownRules from './rules.mdast'; /** @todo: move this logic in to ./blocks/index */

/**
 * @todo:
 *  move this schema stuff in to the block plugin creator Class
 */
const schema = {
  document: {
    // nodes: [{
    //   match: [
    //     {type: 'paragraph'},
    //     {type: 'div'},
    //     {type: 'break'},
    //     {type: 'blockquote'},
    //     {type: 'code'},
    //     {type: 'table'},
    //     {type: 'rdme-figure'},
    //     {type: 'image'},
    //     {type: 'list'},
    //     {type: 'h1'},
    //     {type: 'h2'},
    //     {type: 'h3'},
    //     {type: 'h4'},
    //     {type: 'h5'},
    //     {type: 'h6'},
    //     {type: 'rdme-wrap'},
    //     {type: 'slash-search'},
    //   ]
    // }],
    normalize: (editor, error) => {
      console.error(error)
    },
  },
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
// console.log(schema)

const plugins = [
  ...createBlocks(Object.values(Block.types)), /** @todo: set args as default in the creator class itself */
  ...BlockCommands(
    /** @todo: figure out how to encapsulate this within each block spec */
    ['/', 'space', 'slash-search'],
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

const markdown = new Serial({ rules: markdownRules }); /** @todo: export this from the block creator class */

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: markdown.deserialize(props.value || 'Write some markdown to start documenting your API!'),
      dirty: false,
    }
    this.editor = React.createRef();
  }
  /* componentDidMount(){
    // console.log('mounted')
  } */
  editorHasSelection() {
    const {editor} = this;
    const anchor = editor.value.selection.get('anchor');
    const focus = editor.value.selection.get('focus');
    // console.log({anchor, focus})
    if (anchor.get('offset') === focus.get('offset')) return false;
    return true
  }
  onChange = ({ value }) => {
    this.setState({ value, dirty: false, })
  }
  onContextMenu(event, editor, next) {
    event.preventDefault()
    return false
  }
  onKeyDown = (event, editor, next) => {
    const {key, shiftKey, ctrlKey, metaKey} = event
    const {blocks} = this.editor.value
    const hasSelection = this.editorHasSelection();

    switch (key) {
      case 'Enter':
        if (metaKey || ctrlKey) {
          event.preventDefault() | editor.insertBlock('paragraph').unwrapBlock();
          break;
        }
      case 'a':
        if (/* !hasSelection && */ (metaKey || ctrlKey)) {
          event.preventDefault()
          editor.moveStartToStartOfBlock().moveEndToEndOfBlock();
          break;
        }  
    }

    if (editor.inCodeBlock()) switch (key) {
      case 'Enter':
        event.preventDefault();
        editor.command('insertText', '\n');
        return;
      case "(":
      case "{":
      case "[":
      case "`":
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
          return;
        }
      };
    }

    switch (key) {
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
    };

    if (!(event.ctrlKey || event.metaKey)) return next();

    else switch (event.key) {
      // case 'Backspace':
      //   break;
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
        editor.setBlocks('paragraph').unwrapBlock();
        break
      }
      case 'S': {
        event.preventDefault();
        event.stopPropagation();
        const AST = markdown.serialize(editor.value);
        const {saveHandler} = this.props;
        console.log(saveHandler)
        const method = (saveHandler || new Function)
        method(AST)
        return false;
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