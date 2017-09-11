import CallOut from './CallOut';
import Html from './Html';
import TextArea from './TextArea';
import BlockCode from './Code';
import ImageBlock from './Image';
import Embed from './Embed';
import Parameters from './Parameters';
import ApiHeader from './ApiHeader';

const React = require('react');
const PropTypes = require('prop-types');

const parseBlocks = require('../lib/parse-magic-blocks');

const Loop = ({ content, column }) => {
  const elements = content.map((block, i) => {
    switch (block.type) {
      case 'textarea':
        // eslint-disable-next-line react/no-array-index-key
        return <TextArea key={i} block={block} />;
      case 'html' :
        // eslint-disable-next-line react/no-array-index-key
        return <Html key={i} block={block} />;
      case 'embed' :
        // eslint-disable-next-line react/no-array-index-key
        return <Embed key={i} block={block} />;
      case 'api-header' :
        // eslint-disable-next-line react/no-array-index-key
        return <ApiHeader key={i} block={block} />;
      case 'code' :
        // eslint-disable-next-line react/no-array-index-key
        return <BlockCode key={i} dark={column === 'right'} />;
      case 'callout':
        // eslint-disable-next-line react/no-array-index-key
        return <CallOut key={i} block={block} />;
      case 'parameters' :
        // eslint-disable-next-line react/no-array-index-key
        return <Parameters key={i} block={block} />;
      case 'image' :
        // eslint-disable-next-line react/no-array-index-key
        return <ImageBlock key={i} block={block} />;
      default :
        return null;
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
  column: PropTypes.string,
};

Loop.defaultProps = {
  column: 'left',
};

Opts.propTypes = {
  'is-three-column': PropTypes.bool,
  body: PropTypes.string,
};

Opts.defaultProps = {
  'is-three-column': false,
  body: '',
};

module.exports = Opts;
