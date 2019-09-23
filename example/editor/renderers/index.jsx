import React from 'react';

// Marks
import Bold from './marks/bold';
import Code from './marks/code';
import Italic from './marks/italic';
import Underlined from './marks/underlined';
import Deleted from './marks/deleted';
import Added from './marks/added';

const renderNode = (props, editor, next) => {
  const { attributes, children, node, isFocused } = props;
  switch (node.type) {
    case 'blockquote':
      return <blockquote {...attributes}>{children}</blockquote>;

    case 'list-item-child':
      return <span {...attributes}>{children}</span>;

    case 'hr':
    case 'horizontal-rule':
    case 'break':
      return <hr />;

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
