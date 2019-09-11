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
    var rendered;
    console.groupCollapsed(node.type)
    switch (node.type) {
      case 'p':
      case 'paragraph':
        rendered = <p {...attributes}>{children}</p>;
        break;
      case 'blockquote':
      case 'block-quote':
        rendered = <blockquote {...attributes}>{children}</blockquote>;
        break;
      case 'ul':
      case 'bulleted-list':
        rendered = <ul {...attributes}>{children}</ul>;
        break;
      case 'ol':
      case 'ordered-list':
        rendered = <ol {...attributes}>{children}</ol>;
        break;
      case 'todo-list':
        rendered = <ul {...attributes} className="todo">{children}</ul>;
        break;
      case 'table':
        rendered = (<table {...attributes}>
          <tbody>{children}</tbody>
        </table>);
        break;
      case 'tr':
      case 'table-row':
        rendered = <tr {...attributes}>{children}</tr>;
        break;
      case 'th':
      case 'table-head':
        rendered = <th {...attributes}>{children}</th>;
        break;
      case 'td':
      case 'table-cell':
        rendered = <td {...attributes}>{children}</td>;
        break;
      case 'li':
      case 'list-item':
        rendered = <li {...attributes}>{children}</li>;
        break;
      case 'hr':
      case 'horizontal-rule':
        rendered = <hr />;
        break;
      case 'code':
      case 'pre': {
        console.log(node.data.get('language'))
        rendered = <pre {...attributes} data-lang={node.data.get('language')}>{children}</pre>;
        break;
      }
      case 'img':
      case 'image':
        rendered = <img src={node.data.get('src')} alt={node.data.get('title')} />;
        break;
      case 'a':
      case 'anchor':
      case 'link':
        rendered = <a {...attributes} href={node.data.get('href')}>{children}</a>;
        break;
      case 'h1':
      case 'heading1':
        rendered = <h1 {...attributes}>{children}</h1>;
        break;
      case 'h2':
      case 'heading2':
        rendered = <h2 {...attributes}>{children}</h2>;
        break;
      case 'h3':
      case 'heading3':
        rendered = <h3 {...attributes}>{children}</h3>;
        break;
      case 'h4':
      case 'heading4':
        rendered = <h4 {...attributes}>{children}</h4>;
        break;
      case 'h5':
      case 'heading5':
        rendered = <h5 {...attributes}>{children}</h5>;
        break;
      case 'h6':
      case 'heading6':
        rendered = <h6 {...attributes}>{children}</h6>;
        break;
      default:
        rendered = next();
        break;
    }
    console.groupEnd();
    return rendered
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