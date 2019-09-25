import Link from './link';
import Image from './image';
import List from './list';
import ListItem from './list/item';
import ListItemChild from './list/item/child';
import RdmeCallout from './rdme-callout';
import RdmeWrap from './rdme-wrap';
import RdmeFigure from './rdme-figure';
import Codeblock from './codeblock';
import Paragraph from './paragraph';
import SlashSearch from './slash-search';
import Table from './table';
import TableRow from './table/row';
import TableHead from './table/head';
import TableCell from './table/cell';
import Blockquote from './blockquote';
import Heading from './heading';
import Break from './break';

function SlateBlock(config) {
  // infer match for `type` blocks
  config.match = config.match ? config.match : [];
  config.match.push(config.type);

  const {commands, queries} = config;

  if (commands) this.commands = commands;
  if (queries) this.queries = queries;

  this.renderNode = (props, editor, next) => {
    const { node } = props;
    if (config.match.indexOf(node.type) >= 0) return config.render(props);
    return next();
  };

  return this;
}

const createBlocks = configs => configs.map(cnf => new SlateBlock(cnf));

const types = {
  Paragraph,
  Break,
  Link,
  Image,
  List,
  ListItem,
  ListItemChild,
  Table,
  TableRow,
  TableHead,
  TableCell,
  RdmeCallout,
  RdmeWrap,
  RdmeFigure,
  Codeblock,
  Blockquote,
  Heading,
  SlashSearch,
};

Object.assign(SlateBlock, {types});

export default SlateBlock;
export { createBlocks, types };
