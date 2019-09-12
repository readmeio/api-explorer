import React from 'react';

const handleClicks = (kid) => {
  const tabsWrap = document.querySelectorAll('.tabs_initialState')[0];
  if (tabsWrap) tabsWrap.classList.remove('tabs_initialState');
  document.querySelectorAll('.tab_active').forEach(el => el.classList.remove('tab_active'));
  document.querySelectorAll(`[data-key="${kid.key}"]`)[0].classList.add('tab_active');
};

const renderNode = (props, editor, next) => {
  const { attributes, children, node } = props;

  switch (node.type) {
    case 'p':
    case 'paragraph':
      return <p {...attributes}>{children}</p>;
    case 'rdme-wrap':
      return (
        <div className={`tabs_initialState ${node.data.get('className')}`} {...attributes}>
          {children.map(kid => (<button key={`tab-toggle-${kid.key}`} onClick={() => handleClicks(kid)}>
            { kid.props.node.get('data').get('meta') || `(${kid.props.node.get('data').get('lang')})` }
          </button>))}
          {children}
        </div>
      );
    case 'blockquote':
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'figure':
      return <figure {...attributes}>{children}</figure>;
    case 'ul':
    case 'bulleted-list':
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
      return <li className="list-item" {...attributes}>{children}</li>;
    case 'hr':
    case 'horizontal-rule':
    case 'break':
      return <hr />;
    case 'code':
    case 'pre': {
      return (<pre {...attributes} className={node.data.get('className')} data-lang={node.data.get('lang')}>
        {children}
      </pre>);
    }
    case 'img':
    case 'image':
      return <img src={node.data.get('src')} title={node.data.get('title')} alt={node.data.get('alt')} />;
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

export { renderNode, renderMark };
