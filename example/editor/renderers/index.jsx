import React from 'react';

// Blocks
import RdmeWrap from './blocks/rdme-wrap';
import CodeBlock from './blocks/code';
// Marks
import Bold from './marks/bold';
import Code from './marks/code';
import Italic from './marks/italic';
import Underlined from './marks/underlined';
import Deleted from './marks/deleted';
import Added from './marks/added';

const renderNode = (props, editor, next) => {
  const { attributes, children, node } = props;

  switch (node.type) {
    case 'p':
    case 'paragraph':
      return <p {...attributes}>{children}</p>;
    case 'rdme-wrap':
      return RdmeWrap(props, node, attributes);
    case 'blockquote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'rdme-figure':
      return <figure {...attributes}>{children}</figure>;
    case 'ul':
    case 'bulleted-list':
    case 'unordered-list':
      return <ul className="bulleted-list" {...attributes}>{children}</ul>;
    case 'ol':
    case 'ordered-list':
      return <ol className="ordered-list" {...attributes}>{children}</ol>;
    case 'todo-list':
      return <ul className="todo-list" {...attributes}>{children}</ul>;
    case 'table':
      return (<table {...attributes}>
        <tbody>{children}</tbody>
      </table>);
    case 'tr':
    case 'tableRow':
    case 'table-row':
      return <tr {...attributes}>{children}</tr>;
    case 'th':
    case 'tableHead':
    case 'table-head':
      return <th {...attributes}>{children}</th>;
    case 'td':
    case 'tableCell':
    case 'table-cell':
      return <td {...attributes}>{children}</td>;
    case 'li':
    case 'list-item':
      return <li {...attributes} className="list-item">{children}</li>;
    case 'hr':
    case 'horizontal-rule':
    case 'break':
      return <hr />;
    case 'code':
    case 'pre': {
      return CodeBlock(props, node, attributes);
    }
    case 'img':
    case 'image':
      return <img {...attributes} src={node.data.get('src')} title={node.data.get('title')} alt={node.data.get('alt')} />;
    case 'a':
    case 'anchor':
    case 'link':
      return <a {...attributes} href={node.data.get('href')}>{children}</a>;
    case 'h1':
    case 'heading1':
      return <h1 {...attributes}>{children}</h1>;
    case 'h2':
    case 'heading2':
      return <h2 {...attributes}>{children}</h2>;
    case 'h3':
    case 'heading3':
      return <h3 {...attributes}>{children}</h3>;
    case 'h4':
    case 'heading4':
      return <h4 {...attributes}>{children}</h4>;
    case 'h5':
    case 'heading5':
      return <h5 {...attributes}>{children}</h5>;
    case 'h6':
    case 'heading6':
      return <h6 {...attributes}>{children}</h6>;
    default:
      return next();
  }
};

const renderMark = (props, editor, next) => {
  switch (props.mark.type) {
    case 'bold': return Bold(props);
    case 'code': return Code(props);
    case 'italic': return Italic(props);
    case 'underlined': return Underlined(props);
    case 'deleted': return Deleted(props);
    case 'added': return Added(props);
    default: return next();
  }
};

export { renderNode, renderMark };
