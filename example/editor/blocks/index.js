import Image from './image';
import List from './list';
import ListItem from './list/item';
import RdmeWrap from './rdme-wrap';
import RdmeFigure from './rdme-figure';
import Code from './code';
import Paragraph from './paragraph';
import SlashSearch from './slash-search';
import Table from './table';
import TableRow from './table/row';
import TableHead from './table/head';
import TableCell from './table/cell';

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

SlateBlock.types = {
  Paragraph,
  Image,
  List,
  ListItem,
  Table,
  TableRow,
  TableHead,
  TableCell,
  RdmeWrap,
  RdmeFigure,
  Code,
  SlashSearch,
};

const createBlocks = configs => configs.map(cnf => new SlateBlock(cnf));

export default SlateBlock;
export { createBlocks };
