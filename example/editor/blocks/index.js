import List from './list';
import ListItem from './list/item';
import RdmeWrap from './rdme-wrap';
import RdmeFigure from './rdme-figure';
import Code from './code';

function SlateBlock(config) {
  config.match = config.match ? config.match : [];
  config.match.push(config.type);

  this.renderNode = (props, editor, next) => {
    const { node } = props;
    if (config.match.indexOf(node.type) >= 0) {
      return config.render(props);
    }
    return next();
  };
  return this;
}

SlateBlock.types = {
  List,
  ListItem,
  RdmeWrap,
  RdmeFigure,
  Code,
};

const createBlocks = configs => configs.map(cnf => new SlateBlock(cnf));

export default SlateBlock;
export { createBlocks };
