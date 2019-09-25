import { rule as List } from './blocks/list';
import { rule as ListItem } from './blocks/list/item';
import { rule as ListItemChild } from './blocks/list/item/child';
import { rule as RdmeCallout } from './blocks/rdme-callout';
import { rule as RdmeWrap } from './blocks/rdme-wrap';
import { rule as RdmeFigure } from './blocks/rdme-figure';
import { rule as Codeblock } from './blocks/codeblock';
import { rule as Image } from './blocks/image';
import { rule as Table } from './blocks/table';
import { rule as TableRow } from './blocks/table/row';
import { rule as TableHead } from './blocks/table/head';
import { rule as TableCell } from './blocks/table/cell';
import { rule as Paragraph } from './blocks/paragraph';
import { rule as Blockquote } from './blocks/blockquote';
import { rule as Break } from './blocks/break';
import { rule as Link } from './blocks/link';
import { rule as Heading } from './blocks/heading';

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

const rules = {
  ListItemChild,
  Paragraph,
  div,
  Break,
  bold,
  code,
  italic,
  Blockquote,
  Codeblock,
  Table,
  TableHead,
  TableRow,
  TableCell,
  RdmeFigure,
  RdmeCallout,
  Image,
  Link,
  List,
  ListItem,
  Heading,
  RdmeWrap,
};

export default Object.values(rules);
export { rules };
