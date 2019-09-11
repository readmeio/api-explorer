import React from 'react';

const renderNode = (props, editor, next) => {
  const { attributes, children, node } = props;

  let render;
  switch (node.type) {
    case 'p':
    case 'paragraph':
      render = <p {...attributes}>{children}</p>;
      break;
    case 'rdme-wrap':
      render = <div className={node.className} {...attributes}>{children}</div>;
      break;
    case 'blockquote':
    case 'block-quote':
      render = <blockquote {...attributes}>{children}</blockquote>;
      break;
    case 'ul':
    case 'bulleted-list':
      render = <ul {...attributes}>{children}</ul>;
      break;
    case 'ol':
    case 'ordered-list':
      render = <ol {...attributes}>{children}</ol>;
      break;
    case 'todo-list':
      render = <ul {...attributes} className="todo">{children}</ul>;
      break;
    case 'table':
      render = (<table {...attributes}>
        <tbody>{children}</tbody>
      </table>);
      break;
    case 'tr':
    case 'table-row':
      render = <tr {...attributes}>{children}</tr>;
      break;
    case 'th':
    case 'table-head':
      render = <th {...attributes}>{children}</th>;
      break;
    case 'td':
    case 'table-cell':
      render = <td {...attributes}>{children}</td>;
      break;
    case 'li':
    case 'list-item':
      render = <li {...attributes}>{children}</li>;
      break;
    case 'hr':
    case 'horizontal-rule':
    case 'break':
      render = <hr />;
      break;
    case 'code':
    case 'pre': {
      console.log(node.data.get('language'))
      render = <pre {...attributes} data-lang={node.data.get('language')}>{children}</pre>;
      break;
    }
    case 'img':
    case 'image':
      render = <img src={node.data.get('src')} alt={node.data.get('title')} />;
      break;
    case 'a':
    case 'anchor':
    case 'link':
      render = <a {...attributes} href={node.data.get('href')}>{children}</a>;
      break;
    case 'h1':
    case 'heading1':
      render = <h1 {...attributes}>{children}</h1>;
      break;
    case 'h2':
    case 'heading2':
      render = <h2 {...attributes}>{children}</h2>;
      break;
    case 'h3':
    case 'heading3':
      render = <h3 {...attributes}>{children}</h3>;
      break;
    case 'h4':
    case 'heading4':
      render = <h4 {...attributes}>{children}</h4>;
      break;
    case 'h5':
    case 'heading5':
      render = <h5 {...attributes}>{children}</h5>;
      break;
    case 'h6':
    case 'heading6':
      render = <h6 {...attributes}>{children}</h6>;
      break;
    default:
      render = next();
      break;
  }

  return render;
};

const renderMark = (props, editor, next) => {
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
};

export default { renderNode, renderMark };
