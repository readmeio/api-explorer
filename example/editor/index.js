import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate'

import SlateMarkdown from '@scottge/slate-markdown-serializer';
import TablePlugin from 'slate-edit-table';

const markdown = new SlateMarkdown();
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
  onKeyDown = (event, editor, next) => {
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
        console.log(markdown.serialize(editor.value));
        break;
      default:
        return next();
    }
  }
  renderNode(props, editor, next) {
    const { attributes, children, node } = props;
    switch (node.type) {
      case 'paragraph':
        return <p {...attributes}>{children}</p>;
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'ordered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'todo-list':
        return <ul {...attributes} className="todo">{children}</ul>;
      case 'table':
        return (<table {...attributes}>
          <tbody>{children}</tbody>
        </table>);
      case 'table-row':
        return <tr {...attributes}>{children}</tr>;
      case 'table-head':
        return <th {...attributes}>{children}</th>;
      case 'table-cell':
        return <td {...attributes}>{children}</td>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'horizontal-rule':
        return <hr />;
      case 'code':
        return (<div>
          <pre {...attributes} data-lang={node.data.get('language')}>{children}</pre>
        </div>);
      case 'image':
        return <img src={node.data.get('src')} alt={node.data.get('title')} />;
      case 'link':
        return <a {...attributes} href={node.data.get('href')}>{children}</a>;
      case 'heading1':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading2':
        return <h2 {...attributes}>{children}</h2>;
      case 'heading3':
        return <h3 {...attributes}>{children}</h3>;
      case 'heading4':
        return <h4 {...attributes}>{children}</h4>;
      case 'heading5':
        return <h5 {...attributes}>{children}</h5>;
      case 'heading6':
        return <h6 {...attributes}>{children}</h6>;
      default:
        return next();
    }
  }  
  renderMark(props, editor, next) {
    switch (props.mark.type) {
      case 'bold':
        return <strong>{props.children}</strong>;
      case 'code':
        return <code>{props.children}</code>;
      case 'italic':
        return <em>{props.children}</em>;
      case 'underlined':
        return <u>{props.children}</u>;
      case 'deleted':
        return <del>{props.children}</del>;
      case 'added':
        return <mark>{props.children}</mark>;
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
        renderNode={this.renderNode}
        renderMark={this.renderMark}
        onContextMenu={this.onContextMenu}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        spellCheck={false}
      />
    )
  }
}

export default App;