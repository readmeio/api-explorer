import { rule as List } from './blocks/list';
import { rule as ListItem } from './blocks/list/item';
import { rule as RdmeWrap } from './blocks/rdme-wrap';
import { rule as CodeBlock } from './blocks/code';

const paragraph = {
  match: node => node.object === 'block' && node.type === 'paragraph',
  matchMdast: node => node.type === 'paragraph',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'paragraph',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'paragraph',
    children: visitChildren(object),
  }),
};

const rdmeFigure = {
  match: node => node.object === 'block' && node.type === 'rdme-figure',
  matchMdast: node => node.type === 'rdme-figure',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'rdme-figure',
    data: {
      className: node.className,
    },
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'rdme-figure',
    className: object.data.className,
    children: visitChildren(object),
  }),
};

const div = {
  match: node => node.object === 'block' && node.type === 'div',
  matchMdast: node => node.type === 'div',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'div',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'div',
    children: visitChildren(object),
  }),
};

const br = {
  match: node => node.type === 'break',
  matchMdast: node => node.type === 'thematicBreak',
  fromMdast: () => ({
    object: 'block',
    type: 'break',
  }),
  toMdast: () => ({ type: 'thematicBreak' }),
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
  match: node => node.object === 'block' && node.type === 'blockquote',
  matchMdast: node => node.type === 'blockquote',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'blockquote',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'blockquote',
    children: visitChildren(object),
  }),
};

const listItemChild = {
  match: node => node.object === 'block' && node.type === 'list-item-child',
  matchMdast: (node, _index, parent) =>
    node.type === 'paragraph' && parent.type === 'listItem',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'list-item-child',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'paragraph',
    children: visitChildren(object),
  }),
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
    fromMdast: (node, _index, _parent, { visitChildren }) => ({
      object: 'block',
      type: nodeType,
      nodes: visitChildren(node),
    }),
    toMdast: (object, _index, _parent, { visitChildren }) => ({
      type: 'heading',
      depth: headingOffset + 1,
      children: visitChildren(object),
    }),
  }))
  .reverse();

const bold = {
  match: node => node.object === 'mark' && node.type === 'bold',
  matchMdast: node => node.type === 'strong',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'mark',
    type: 'bold',
    nodes: visitChildren(node),
  }),
  toMdast: (mark, _index, _parent, { visitChildren }) => ({
    type: 'strong',
    children: visitChildren(mark),
  }),
};

const table = {
  match: node => node.object === 'block' && node.type === 'table',
  matchMdast: node => node.type === 'table',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'table',
    nodes: visitChildren(node),
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'table',
    value: visitChildren(node),
    children: visitChildren(node),
  }),
};
const tableRow = {
  match: node => node.object === 'block' && node.type === 'tableRow',
  matchMdast: node => node.type === 'tableRow',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'tableRow',
    nodes: visitChildren(node),
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'tableRow',
    value: visitChildren(node),
    children: visitChildren(node),
  }),
};
const tableHead = {
  match: node => node.object === 'block' && node.type === 'tableHead',
  matchMdast: node => node.type === 'tableHead',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'tableHead',
    nodes: visitChildren(node),
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'tableCell',
    value: visitChildren(node),
    children: visitChildren(node),
  }),
};
const tableCell = {
  match: node => node.object === 'block' && node.type === 'tableCell',
  matchMdast: node => node.type === 'tableCell',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'tableCell',
    nodes: visitChildren(node),
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'tableCell',
    value: visitChildren(node),
    children: visitChildren(node),
  }),
};

const code = {
  match: node => node.object === 'mark' && node.type === 'code',
  matchMdast: node => node.type === 'inlineCode',
  fromMdast: node => ({
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
  }),
  toMdast: (mark, _index, _parent, { visitChildren }) => ({
    type: 'inlineCode',
    value: visitChildren(mark)
      .map(childNode => childNode.value)
      .join(''),
  }),
};

const italic = {
  match: node => node.object === 'mark' && node.type === 'italic',
  matchMdast: node => node.type === 'emphasis',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'mark',
    type: 'italic',
    nodes: visitChildren(node),
  }),
  toMdast: (mark, _index, _parent, { visitChildren }) => ({
    type: 'emphasis',
    children: visitChildren(mark),
  }),
};

const link = {
  match: node => node.object === 'inline' && node.type === 'link',
  matchMdast: node => node.type === 'link',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'inline',
    type: 'link',
    data: {
      href: node.url,
      title: node.title,
      target: node.target,
    },
    nodes: visitChildren(node),
  }),
  toMdast: (mark, _index, _parent, { visitChildren }) => ({
    type: 'link',
    url: mark.data.href,
    title: mark.data.title,
    target: mark.data.target,
    children: visitChildren(mark),
  }),
};

export default [
  listItemChild,
  paragraph,
  div,
  br,
  bold,
  code,
  italic,
  blockQuote,
  CodeBlock,
  table,
  tableHead,
  tableRow,
  tableCell,
  rdmeFigure,
  image,
  link,

  List,
  ListItem,

  ...headings,
  RdmeWrap,
];
