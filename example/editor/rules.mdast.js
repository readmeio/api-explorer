const paragraph = {
  match: node => node.object === 'block' && node.type === 'paragraph',
  matchMdast: node => node.type === 'paragraph',
  fromMdast: (node, _index, parent, { visitChildren }) => ({
    object: 'block',
    type: 'paragraph',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, parent, { visitChildren }) => ({
    type: 'paragraph',
    children: visitChildren(object),
  }),
};

const figure = {
  match: node => node.object === 'block' && node.type === 'figure',
  matchMdast: node => node.type === 'figure',
  fromMdast: (node, _index, parent, { visitChildren }) => ({
    object: 'block',
    type: 'figure',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, parent, { visitChildren }) => ({
    type: 'figure',
    children: visitChildren(object),
  }),
};

const div = {
  match: node => node.object === 'block' && node.type === 'div',
  matchMdast: node => node.type === 'div',
  fromMdast: (node, _index, parent, { visitChildren }) => ({
    object: 'block',
    type: 'div',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, parent, { visitChildren }) => ({
    type: 'div',
    children: visitChildren(object),
  }),
};

const br = {
  match: node => node.type === 'break',
  matchMdast: node => node.type === 'thematicBreak',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'break',
  }),
  toMdast: object => ({ type: 'thematicBreak' }),
};

const image = {
  match: node => node.object === 'block' && node.type === 'image',
  matchMdast: node => node.type === 'image',
  fromMdast: node => ({
    object: 'block',
    type: 'image',
    isVoid: true,
    data: {
      alt: node.alt,
      src: node.url,
      title: node.title,
    },
    nodes: [],
  }),
  toMdast: object => ({
    type: 'image',
    alt: object.data.alt,
    url: object.data.src,
  }),
};

const blockQuote = {
  match: node => node.object === 'block' && node.type === 'block-quote',
  matchMdast: node => node.type === 'blockquote',
  fromMdast: (node, index, parent, { visitChildren }) => ({
    object: 'block',
    type: 'block-quote',
    nodes: visitChildren(node),
  }),
  toMdast: (object, index, parent, { visitChildren }) => ({
    type: 'blockquote',
    children: visitChildren(object),
  }),
};

const bulletedList = {
  match: node => node.object === 'block' && node.type === 'bulleted-list',
  matchMdast: node => node.type === 'list' && !node.ordered,
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'bulleted-list',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'list',
    ordered: false,
    children: visitChildren(object),
  }),
};

const orderedList = {
  match: node => node.object === 'block' && node.type === 'numbered-list',
  matchMdast: node => node.type === 'list' && node.ordered,
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'ordered-list',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => {
    return {
      type: 'list',
      ordered: true,
      children: visitChildren(object),
    };
  },
};

const listItem = {
  match: node => node.object === 'block' && node.type === 'list-item',
  matchMdast: node => node.type === 'listItem',
  fromMdast: (node, index, parent, { visitChildren }) => {
    return {
      object: 'block',
      type: 'list-item',
      nodes: visitChildren(node),
    };
  },
  toMdast: (object, _index, _parent, { visitChildren }) => {
    return {
      type: 'listItem',
      children: visitChildren(object),
    };
  },
};

const listItemChild = {
  match: node => node.object === 'block' && node.type === 'list-item-child',
  matchMdast: (node, _index, parent) =>
    node.type === 'paragraph' && parent.type === 'listItem',
  fromMdast: (node, index, parent, { visitChildren }) => {
    return {
      object: 'block',
      type: 'list-item-child',
      nodes: visitChildren(node),
    };
  },
  toMdast: (object, _index, parent, { visitChildren }) => {
    return {
      type: 'paragraph',
      children: visitChildren(object),
    };
  },
};

const headings = [
  'h1', // 'heading-one',
  'h2', // 'heading-two',
  'h3', // 'heading-three',
  'h4', // 'heading-four',
  'h5', // 'heading-five',
  'h6', // 'heading-six',
]
  .map((nodeType, headingOffset) => ({
    match: node => node.object === 'block' && node.type === nodeType,
    matchMdast: node =>
      node.type === 'heading' && node.depth === headingOffset + 1,
    fromMdast: (node, index, parent, { visitChildren }) => ({
      object: 'block',
      type: nodeType,
      nodes: visitChildren(node),
    }),
    toMdast: (object, index, parent, { visitChildren }) => ({
      type: 'heading',
      depth: headingOffset + 1,
      children: visitChildren(object),
    }),
  }))
  .reverse();

const bold = {
  match: node => node.object === 'mark' && node.type === 'bold',
  matchMdast: node => node.type === 'strong',
  fromMdast: (node, index, parent, { visitChildren }) => {
    return {
      object: 'mark',
      type: 'bold',
      nodes: visitChildren(node),
    };
  },
  toMdast: (mark, index, parent, { visitChildren }) => {
    return {
      type: 'strong',
      children: visitChildren(mark),
    };
  },
};

const codeBlock = {
  match: node => node.object === 'block' && node.type === 'pre',
  matchMdast: node => node.type === 'code',
  fromMdast: (node, _index, _parent, { visitChildren }) => {
    const { lang, meta, className } = node;
    return {
      object: 'block',
      type: 'pre',
      nodes: [{ object: 'text', text: node.value }],
      data: { lang, meta, className },
    };
  },
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'code',
    value: visitChildren(node)
      .map(childNode => childNode.value)
      .filter(Boolean)
      .join('\n'),
  }),
};

const table = {
  match: node => node.object === 'block' && node.type === 'table',
  matchMdast: node => node.type === 'code',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'table',
    nodes: visitChildren(node),
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'table',
    value: visitChildren(node),
  }),
};

const code = {
  match: node => node.object === 'mark' && node.type === 'code',
  matchMdast: node => node.type === 'inlineCode',
  fromMdast: (node, index, parent, { visitChildren }) => {
    return {
      object: 'mark',
      type: 'code',
      nodes: [
        {
          object: 'text',
          leaves: [
            {
              marks: [],
              object: 'leaf',
              text: node.value,
            },
          ],
        },
      ],
    };
  },
  toMdast: (mark, index, parent, { visitChildren }) => {
    return {
      type: 'inlineCode',
      value: visitChildren(mark)
        .map(childNode => childNode.value)
        .join(''),
    };
  },
};

const italic = {
  match: node => node.object === 'mark' && node.type === 'italic',
  matchMdast: node => node.type === 'emphasis',
  fromMdast: (node, index, parent, { visitChildren }) => ({
    object: 'mark',
    type: 'italic',
    nodes: visitChildren(node),
  }),
  toMdast: (mark, index, parent, { visitChildren }) => ({
    type: 'emphasis',
    children: visitChildren(mark),
  }),
};

const link = {
  match: node => node.object === 'inline' && node.type === 'link',
  matchMdast: node => node.type === 'link',
  fromMdast: (node, index, parent, { visitChildren }) => ({
    object: 'inline',
    type: 'link',
    data: {
      href: node.url,
      title: node.title,
      target: node.target,
    },
    nodes: visitChildren(node),
  }),
  toMdast: (mark, index, parent, { visitChildren }) => ({
    type: 'link',
    url: mark.data.href,
    title: mark.data.title,
    target: mark.data.target,
    children: visitChildren(mark),
  }),
};

const rdmeWrap = {
  match: node =>
    node.object === 'block' && node.type === 'rdme-wrap',
  matchMdast: node =>
    node.type === 'rdme-wrap',
  fromMdast: (node, index, parent, { visitChildren }) => ({
    object: 'block',
    type: 'rdme-wrap',
    nodes: visitChildren(node),
    data: {
      className: node.className,
    },
  }),
  toMdast: (node, index, parent, { visitChildren }) => ({
    type: 'rdme-wrap',
    children: visitChildren(node),
  }),
};

export default [
  listItemChild,
  paragraph,
  rdmeWrap,
  div,
  br,
  bold,
  code,
  italic,
  blockQuote,
  codeBlock,
  table,
  figure,
  image,
  link,
  bulletedList,
  orderedList,
  listItem,
  ...headings,
];
