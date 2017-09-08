import Callout from './callout';
import Html from './html';
import Textarea from './textarea';
import BlockCode from './code';
import ImageBlock from './image';
import Embed from './embed';
import Parameters from './parameters';
import ApiHeader from './api-header';

const React = require('react');
const PropTypes = require('prop-types');

const parseBlocks = require('../lib/parse-magic-blocks');

const Loop = ({ content, column }) => {
  const elements = content.map((block) => {
    switch (block.type) {
      case 'textarea':
        return <Textarea block={block} />;
      case 'html' :
        return <Html block={block} />;
      case 'embed' :
        return <Embed block={block} />;
      case 'api-header' :
        return <ApiHeader block={block} />;
      case 'code' :
        return <BlockCode dark={column === 'right'} />;
      case 'callout':
        return <Callout block={block} />;
      case 'parameters' :
        return <Parameters block={block} />;
      case 'image' :
        return <ImageBlock block={block} />;
      default :
        return <div />;
    }
  });
  return (
    <div>
      { elements }
    </div>
  );
};

const Opts = (props) => {
  const { body } = props;
  const isThreeColumn = props['is-three-column'];

  const content = parseBlocks(body);
  // console.log(content);


  if (isThreeColumn) {
    content.left = [];
    content.right = [];
    content.forEach((elem) => {
      if (elem.sidebar) {
        content.right.push(elem);
      } else {
        content.left.push(elem);
      }
    });
  }

  if (isThreeColumn) {
    return (
      <div className="hub-reference-section">
        <div className="hub-reference-left">
          <div className="content-body">
            <Loop content={content.left} column="left" />
          </div>
        </div>
        <div className="hub-reference-right">
          <div className="content-body">
            <Loop content={content.right} column="right" />
          </div>
        </div>
      </div>
    );
  }

  return <Loop content={content} />;
};


Loop.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
  })).isRequired,
  column: PropTypes.string.isRequired,
};

Opts.propTypes = {
  'is-three-column': PropTypes.bool.isRequired,
  body: PropTypes.string.isRequired,
};

module.exports = Opts;
