import List from './list';
import ListItem from './list/item';
import RdmeWrap from './rdme-wrap';
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

// const createBlock = config => new SlateBlock(config);

Object.assign(SlateBlock, {
  List,
  ListItem,
  RdmeWrap,
  Code,
});

export default SlateBlock;
